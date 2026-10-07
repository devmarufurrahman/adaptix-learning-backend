import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterStep1Dto } from './dto/register-step1.dto.js';
import { CompleteProfileDto } from './dto/complete-profile.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    private async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key',
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
                expiresIn: '30d',
            }),
        ]);

        return { accessToken, refreshToken };
    }

    private async updateRefreshTokenHash(userId: string, refreshToken: string) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hash },
        });
    }

    async registerStep1(dto: RegisterStep1Dto) {
        const userExists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (userExists) {
            throw new BadRequestException('User already exists with this email');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const studentRole = await this.prisma.role.findUnique({
            where: { name: 'STUDENT' }
        });

        if (!studentRole) {
            throw new BadRequestException('Default STUDENT role not found in system');
        }

        const newUser = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                isProfileComplete: false,
                roleId: studentRole.id,
            },
        });

        const tokens = await this.generateTokens(newUser.id, newUser.email);
        await this.updateRefreshTokenHash(newUser.id, tokens.refreshToken);

        return {
            message: 'Registration step 1 successful',
            user: {
                id: newUser.id,
                email: newUser.email,
                isProfileComplete: newUser.isProfileComplete,
            },
            ...tokens,
        };
    }

    async refreshTokens(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
            });

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || !user.refreshToken) {
                throw new ForbiddenException('Access Denied');
            }

            const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
            if (!isMatch) {
                throw new ForbiddenException('Access Denied');
            }

            const tokens = await this.generateTokens(user.id, user.email);
            await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

            return tokens;
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async completeProfile(userId: string, dto: CompleteProfileDto) {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: dto.name,
                phone: dto.phone,
                gender: dto.gender,
                image: dto.image,
                isProfileComplete: true,
            },
        });

        return {
            message: 'Profile completed successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                gender: updatedUser.gender,
                image: updatedUser.image,
                isProfileComplete: updatedUser.isProfileComplete,
            },
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

        return {
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                image: user.image,
                isProfileComplete: user.isProfileComplete,
            },
            ...tokens,
        };
    }

    async logout(userId: string) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                refreshToken: { not: null },
            },
            data: {
                refreshToken: null,
            },
        });

        return { message: 'Logged out successfully' };
    }


    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new BadRequestException('User with this email does not exist');
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const resetToken = await this.jwtService.signAsync(
            { email: user.email, otp },
            {
                secret: process.env.JWT_RESET_SECRET || 'reset-otp-secret-key',
                expiresIn: '5m',
            },
        );

        return {
            message: 'OTP generated successfully',
            devOtp: otp,
            resetToken,
        };
    }

    async verifyOtp(dto: VerifyOtpDto) {
        try {
            const payload = await this.jwtService.verifyAsync(dto.resetToken, {
                secret: process.env.JWT_RESET_SECRET || 'reset-otp-secret-key',
            });

            if (payload.otp !== dto.otp) {
                throw new BadRequestException('Invalid OTP');
            }

            const verificationToken = await this.jwtService.signAsync(
                { email: payload.email, verified: true },
                {
                    secret: process.env.JWT_RESET_SECRET || 'reset-otp-secret-key',
                    expiresIn: '10m',
                },
            );

            return {
                message: 'OTP verified successfully',
                verificationToken,
            };
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new BadRequestException('OTP has expired');
            }
            throw new BadRequestException(error.message || 'Invalid token or OTP');
        }
    }

    async resetPassword(dto: ResetPasswordDto) {
        try {
            const payload = await this.jwtService.verifyAsync(dto.verificationToken, {
                secret: process.env.JWT_RESET_SECRET || 'reset-otp-secret-key',
            });

            if (!payload.verified) {
                throw new BadRequestException('Unauthorized password reset request');
            }

            const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

            await this.prisma.user.update({
                where: { email: payload.email },
                data: {
                    password: hashedPassword,
                    refreshToken: null,
                },
            });

            return {
                message: 'Password reset successful. You can now login with your new password.',
            };
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new BadRequestException('Session expired. Please request OTP again.');
            }
            throw new BadRequestException('Invalid or expired verification session');
        }
    }
}
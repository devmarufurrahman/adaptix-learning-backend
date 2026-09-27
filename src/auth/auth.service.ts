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

        const newUser = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                isProfileComplete: false,
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
}
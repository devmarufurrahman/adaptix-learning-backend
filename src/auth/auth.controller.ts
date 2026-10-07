import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterStep1Dto } from './dto/register-step1.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CompleteProfileDto } from './dto/complete-profile.dto.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register-step1')
    registerStep1(@Body() dto: RegisterStep1Dto) {
        return this.authService.registerStep1(dto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshTokens(dto.refreshToken);
    }

    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('complete-profile')
    completeProfile(@Req() req: any, @Body() dto: CompleteProfileDto): Promise<{ message: string; user: { id: string; name: string | null; email: string; phone: string | null; gender: string | null; image: string | null; isProfileComplete: boolean; }; }> {
        const userId = req.user.id;
        return this.authService.completeProfile(userId, dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }


    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Req() req: any) {
        return this.authService.logout(req.user.id);
    }


    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }
}
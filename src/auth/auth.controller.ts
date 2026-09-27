import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterStep1Dto } from './dto/register-step1.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';

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
}
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({ description: 'Token verified from verify-otp API' })
    @IsString()
    @IsNotEmpty({ message: 'Verification token is required' })
    verificationToken: string;

    @ApiProperty({ example: 'newpassword123' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    newPassword: string;
}
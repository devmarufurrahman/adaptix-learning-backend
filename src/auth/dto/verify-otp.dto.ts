import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
    @ApiProperty({ description: 'Token received from forgot-password API' })
    @IsString()
    @IsNotEmpty({ message: 'Reset token is required' })
    resetToken: string;

    @ApiProperty({ example: '1234' })
    @IsString()
    @Length(4, 4, { message: 'OTP must be 4 digits' })
    otp: string;
}
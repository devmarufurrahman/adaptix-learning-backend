import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CompleteProfileDto {
    @ApiProperty({ example: 'Maruf', description: 'User name' })
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @ApiProperty({ example: '017xxxxxxxx', description: 'User phone number' })
    @IsString()
    @IsNotEmpty({ message: 'Phone number is required' })
    phone: string;

    @ApiProperty({ example: 'male', description: 'User gender' })
    @IsString()
    @IsNotEmpty({ message: 'Gender is required' })
    gender: string;

    @ApiProperty({ example: 'image.jpg', description: 'User image' })
    @IsString()
    @IsOptional()
    image?: string;
}
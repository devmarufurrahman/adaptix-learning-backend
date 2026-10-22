import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsUrl,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({
    example: 'NestJS Masterclass: Zero to Hero',
    description: 'Title of the course',
    minLength: 3,
    maxLength: 150,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters' })
  title: string;

  @ApiPropertyOptional({
    example: 'Learn NestJS from scratch with microservices and PostgreSQL.',
    description: 'Detailed description of the course content',
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 49.99,
    description: 'Price of the course (defaults to 0 for free courses)',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number with up to 2 decimal places' })
  @Min(0, { message: 'Price cannot be negative' })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    example: 'https://pub-r2.example.com/courses/nest-thumb.jpg',
    description: 'Public URL to Cloudflare R2 uploaded course thumbnail',
  })
  @IsUrl({}, { message: 'Thumbnail must be a valid URL' })
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the category this course belongs to',
  })
  @IsUUID('4', { message: 'categoryId must be a valid UUIDv4' })
  @IsNotEmpty({ message: 'categoryId is required' })
  categoryId: string;
}

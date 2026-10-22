import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSectionDto {
  @ApiProperty({
    example: 'Module 1: Foundations',
    description: 'Title of the section',
    minLength: 1,
    maxLength: 150,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters' })
  title: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Display order index within the course (auto-increments if omitted)',
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt({ message: 'Order must be an integer' })
  @Min(0, { message: 'Order cannot be negative' })
  @IsOptional()
  order?: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the course',
  })
  @IsUUID('4', { message: 'courseId must be a valid UUIDv4' })
  @IsNotEmpty({ message: 'courseId is required' })
  courseId: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, IsUrl } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'NestJS Masterclass', description: 'Title of the course' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Learn NestJS from scratch' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 49.99 })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'https://example.com/thumb.jpg' })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'UUID of the category' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}

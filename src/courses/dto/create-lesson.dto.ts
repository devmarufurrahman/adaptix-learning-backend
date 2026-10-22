import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsUUID,
  IsUrl,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {
  @ApiProperty({
    example: 'Introduction to Dependency Injection',
    description: 'Title of the lesson',
    minLength: 1,
    maxLength: 200,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @ApiPropertyOptional({
    example: 'In this lesson, we will cover IoC containers and provider scopes.',
    description: 'Optional lesson markdown or text description',
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'f87a8b663ce4e892c2069c9b5a043dc3',
    description: 'Cloudflare Stream UID for anti-piracy video streaming',
  })
  @IsString({ message: 'videoUid must be a string' })
  @IsOptional()
  videoUid?: string;

  @ApiPropertyOptional({
    example: 'https://pub-r2.example.com/courses/notes/lesson-1.pdf',
    description: 'Cloudflare R2 URL for attached PDF slides or notes',
  })
  @IsUrl({}, { message: 'pdfNotesUrl must be a valid URL' })
  @IsOptional()
  pdfNotesUrl?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Display order index within the section (auto-increments if omitted)',
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt({ message: 'Order must be an integer' })
  @Min(0, { message: 'Order cannot be negative' })
  @IsOptional()
  order?: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the parent section',
  })
  @IsUUID('4', { message: 'sectionId must be a valid UUIDv4' })
  @IsNotEmpty({ message: 'sectionId is required' })
  sectionId: string;
}

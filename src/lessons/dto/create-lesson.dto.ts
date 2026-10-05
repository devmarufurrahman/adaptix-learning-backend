import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsUUID, IsUrl } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'What is NestJS?' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'In this lesson, we will learn...' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/slide.pdf' })
  @IsUrl()
  @IsOptional()
  pdfUrl?: string;

  @ApiPropertyOptional({ example: 120, description: 'Duration in seconds' })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: 'uuid-of-section' })
  @IsUUID()
  @IsNotEmpty()
  sectionId: string;
}

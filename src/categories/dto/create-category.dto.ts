import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Web Development', description: 'Name of the category' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Learn to build modern web applications', description: 'Brief description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.png', description: 'Category image URL' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}

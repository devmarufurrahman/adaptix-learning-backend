import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLessonProgressDto {
  @ApiPropertyOptional({
    example: 120,
    description: 'Current watch time in seconds',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'watchTime must be a number' })
  @Min(0, { message: 'watchTime cannot be negative' })
  @IsOptional()
  watchTime?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the lesson is marked as completed',
  })
  @IsBoolean({ message: 'isCompleted must be a boolean' })
  @IsOptional()
  isCompleted?: boolean;
}

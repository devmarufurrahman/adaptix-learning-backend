import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProgressDto {
  @ApiProperty({
    example: 45.5,
    description: 'Percentage of course completed (0 - 100)',
    minimum: 0,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Progress must be a number with up to 2 decimal places' })
  @Min(0, { message: 'Progress cannot be less than 0' })
  @Max(100, { message: 'Progress cannot exceed 100' })
  progress: number;
}

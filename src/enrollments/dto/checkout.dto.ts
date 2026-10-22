import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the course to purchase / enroll in',
  })
  @IsUUID('4', { message: 'courseId must be a valid UUIDv4' })
  @IsNotEmpty({ message: 'courseId is required' })
  courseId: string;

  @ApiPropertyOptional({
    example: 'MANUAL',
    description: 'Payment gateway identifier (e.g. SSLCOMMERZ, STRIPE, MANUAL)',
  })
  @IsString({ message: 'gateway must be a string' })
  @IsOptional()
  gateway?: string;
}

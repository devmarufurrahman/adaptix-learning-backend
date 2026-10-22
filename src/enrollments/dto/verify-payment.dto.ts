import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiPropertyOptional({
    example: 'TXN-1729590000000-A1B2C3D4',
    description: 'Transaction ID from the payment gateway or bank slip',
  })
  @IsString({ message: 'transactionId must be a string' })
  @IsOptional()
  transactionId?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class WebhookSuccessDto {
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the order (provide either orderId or transactionId)',
  })
  @IsString({ message: 'orderId must be a string' })
  @IsOptional()
  orderId?: string;

  @ApiPropertyOptional({
    example: 'TXN-1729590000000-A1B2C3D4',
    description: 'Transaction ID of the order (provide either orderId or transactionId)',
  })
  @IsString({ message: 'transactionId must be a string' })
  @IsOptional()
  transactionId?: string;
}

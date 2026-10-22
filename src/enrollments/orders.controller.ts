import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { WebhookSuccessDto } from './dto/webhook-success.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Initiate a course purchase order with PENDING status' })
  @ApiCreatedResponse({ description: 'Order created with mock payment URL and transaction ID.' })
  checkout(@Body() checkoutDto: CheckoutDto, @Req() req: any) {
    return this.ordersService.checkout(req.user.id, checkoutDto);
  }

  @Post('webhook/success')
  @ApiOperation({
    summary: 'Payment gateway webhook: update order to SUCCESS and activate course enrollment',
  })
  @ApiOkResponse({ description: 'Order status updated to SUCCESS and enrollment created.' })
  webhookSuccess(@Body() webhookSuccessDto: WebhookSuccessDto) {
    return this.ordersService.handleWebhookSuccess(webhookSuccessDto);
  }
}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { EnrollmentsController } from './enrollments.controller.js';
import { EnrollmentsService } from './enrollments.service.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController, EnrollmentsController],
  providers: [OrdersService, EnrollmentsService],
  exports: [OrdersService, EnrollmentsService],
})
export class EnrollmentsModule {}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { WebhookSuccessDto } from './dto/webhook-success.dto.js';
import { OrderStatus, EnrollmentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /orders/checkout
   * - Accepts courseId
   * - Checks if user is already enrolled (throws BadRequestException if true)
   * - Fetches course price
   * - Creates Order with PENDING status
   * - Returns mock payment URL and transactionId
   */
  async checkout(userId: string, checkoutDto: CheckoutDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: checkoutDto.courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${checkoutDto.courseId} not found`);
    }

    // Check if user is already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment && existingEnrollment.status === EnrollmentStatus.ACTIVE) {
      throw new BadRequestException('User is already enrolled in this course');
    }

    const transactionId = `TXN-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create Order with PENDING status
    const order = await this.prisma.order.create({
      data: {
        userId,
        courseId: course.id,
        amount: course.price,
        gateway: checkoutDto.gateway || 'SSLCOMMERZ',
        status: OrderStatus.PENDING,
        transactionId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            thumbnail: true,
          },
        },
      },
    });

    // Mock payment gateway URL (to be replaced with SSLCommerz sandbox/live session URL)
    const mockPaymentUrl = `https://sandbox.sslcommerz.com/gwprocess/v4/mock-payment?transactionId=${transactionId}&orderId=${order.id}&amount=${course.price}`;

    return {
      message: 'Order created successfully. Please complete payment.',
      orderId: order.id,
      transactionId: order.transactionId,
      amount: order.amount,
      status: order.status,
      paymentUrl: mockPaymentUrl,
    };
  }

  /**
   * POST /orders/webhook/success
   * - Accepts transactionId or orderId
   * - Updates Order status to SUCCESS
   * - Automatically creates an Enrollment record for the user and course with ACTIVE status
   */
  async handleWebhookSuccess(dto: WebhookSuccessDto) {
    if (!dto.orderId && !dto.transactionId) {
      throw new BadRequestException('Either orderId or transactionId must be provided');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          ...(dto.orderId ? [{ id: dto.orderId }] : []),
          ...(dto.transactionId ? [{ transactionId: dto.transactionId }] : []),
        ],
      },
      include: { course: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.SUCCESS) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: order.userId,
            courseId: order.courseId,
          },
        },
      });

      return {
        message: 'Order was already processed successfully.',
        order,
        enrollment,
      };
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.SUCCESS,
        },
      });

      const enrollment = await tx.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: order.userId,
            courseId: order.courseId,
          },
        },
        update: {
          status: EnrollmentStatus.ACTIVE,
        },
        create: {
          userId: order.userId,
          courseId: order.courseId,
          status: EnrollmentStatus.ACTIVE,
          progress: 0,
        },
      });

      return {
        message: 'Order marked as SUCCESS and Enrollment activated successfully.',
        order: updatedOrder,
        enrollment,
      };
    });
  }
}

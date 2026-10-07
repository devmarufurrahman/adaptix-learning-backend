import { Module } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service.js';
import { AdminUsersController } from './admin-users.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}

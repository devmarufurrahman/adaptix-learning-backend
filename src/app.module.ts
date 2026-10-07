import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { CoursesModule } from './courses/courses.module.js';
import { SectionsModule } from './sections/sections.module.js';
import { LessonsModule } from './lessons/lessons.module.js';
import { MediaModule } from './media/media.module.js';
import { AdminUsersModule } from './admin-users/admin-users.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'adaptix-learning-backend',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    CoursesModule,
    SectionsModule,
    LessonsModule,
    MediaModule,
    AdminUsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

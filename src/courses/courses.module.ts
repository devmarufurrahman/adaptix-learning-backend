import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';

import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';

import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';

import { SectionsController } from './sections.controller.js';
import { SectionsService } from './sections.service.js';

import { LessonsController } from './lessons.controller.js';
import { LessonsService } from './lessons.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    CoursesController,
    CategoriesController,
    SectionsController,
    LessonsController,
  ],
  providers: [
    CoursesService,
    CategoriesService,
    SectionsService,
    LessonsService,
  ],
  exports: [
    CoursesService,
    CategoriesService,
    SectionsService,
    LessonsService,
  ],
})
export class CoursesModule {}

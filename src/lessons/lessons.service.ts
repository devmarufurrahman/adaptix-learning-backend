import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto) {
    const section = await this.prisma.section.findUnique({
      where: { id: createLessonDto.sectionId },
    });

    if (!section) {
      throw new BadRequestException('Invalid sectionId provided');
    }

    return this.prisma.lesson.create({
      data: createLessonDto,
    });
  }

  async findAll() {
    return this.prisma.lesson.findMany();
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto) {
    await this.findOne(id); // Check existence

    if (updateLessonDto.sectionId) {
      const section = await this.prisma.section.findUnique({
        where: { id: updateLessonDto.sectionId },
      });

      if (!section) {
        throw new BadRequestException('Invalid sectionId provided');
      }
    }

    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence
    
    return this.prisma.lesson.delete({
      where: { id },
    });
  }
}

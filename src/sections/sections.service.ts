import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSectionDto: CreateSectionDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: createSectionDto.courseId },
    });

    if (!course) {
      throw new BadRequestException('Invalid courseId provided');
    }

    return this.prisma.section.create({
      data: createSectionDto,
    });
  }

  async findSectionsByCourse(courseId: string) {
    return this.prisma.section.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.section.findMany();
  }

  async findOne(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return section;
  }

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    await this.findOne(id); // Check existence
    
    if (updateSectionDto.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: updateSectionDto.courseId },
      });

      if (!course) {
        throw new BadRequestException('Invalid courseId provided');
      }
    }

    return this.prisma.section.update({
      where: { id },
      data: updateSectionDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence
    
    return this.prisma.section.delete({
      where: { id },
    });
  }
}

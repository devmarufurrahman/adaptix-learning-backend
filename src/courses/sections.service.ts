import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSectionDto: CreateSectionDto, userId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: createSectionDto.courseId },
    });

    if (!course) {
      throw new BadRequestException('Invalid courseId provided');
    }

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: { include: { permissions: true } } },
      });
      const isSuperAdmin = user?.role?.permissions?.some(
        (p) => p.module === 'ALL' && p.action === 'MANAGE',
      );
      if (!isSuperAdmin && course.instructorId !== userId) {
        throw new ForbiddenException('You do not have permission to add sections to this course');
      }
    }

    let order = createSectionDto.order;
    if (order === undefined || order === null) {
      const lastSection = await this.prisma.section.findFirst({
        where: { courseId: createSectionDto.courseId },
        orderBy: { order: 'desc' },
      });
      order = lastSection ? lastSection.order + 1 : 1;
    }

    return this.prisma.section.create({
      data: {
        ...createSectionDto,
        order,
      },
    });
  }

  async findSectionsByCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

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
    return this.prisma.section.findMany({
      orderBy: { order: 'asc' },
    });
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

  async update(id: string, updateSectionDto: UpdateSectionDto, userId?: string) {
    const section = await this.findOne(id);

    if (userId) {
      const course = await this.prisma.course.findUnique({
        where: { id: section.courseId },
      });
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: { include: { permissions: true } } },
      });
      const isSuperAdmin = user?.role?.permissions?.some(
        (p) => p.module === 'ALL' && p.action === 'MANAGE',
      );
      if (!isSuperAdmin && course?.instructorId !== userId) {
        throw new ForbiddenException('You do not have permission to update this section');
      }
    }

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

  async remove(id: string, userId?: string) {
    const section = await this.findOne(id);

    if (userId) {
      const course = await this.prisma.course.findUnique({
        where: { id: section.courseId },
      });
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: { include: { permissions: true } } },
      });
      const isSuperAdmin = user?.role?.permissions?.some(
        (p) => p.module === 'ALL' && p.action === 'MANAGE',
      );
      if (!isSuperAdmin && course?.instructorId !== userId) {
        throw new ForbiddenException('You do not have permission to delete this section');
      }
    }

    return this.prisma.section.delete({
      where: { id },
    });
  }
}

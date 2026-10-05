import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createCourseDto: CreateCourseDto, instructorId: string) {
    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createCourseDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Invalid categoryId provided');
    }

    const slug = this.generateSlug(createCourseDto.title);
    
    // Check if slug exists
    const existing = await this.prisma.course.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('A course with this title/slug already exists');
    }

    return this.prisma.course.create({
      data: {
        ...createCourseDto,
        slug,
        instructorId,
      },
    });
  }

  async findAll() {
    return this.prisma.course.findMany({
      include: {
        category: {
          select: { id: true, name: true },
        },
        instructor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true },
        },
        instructor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, instructorId: string, role: UserRole) {
    const course = await this.findOne(id); // Throws if not found

    // Permission check: only ADMIN or the specific instructor
    if (role !== UserRole.ADMIN && course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to update this course');
    }

    let slug: string | undefined;

    if (updateCourseDto.title) {
      slug = this.generateSlug(updateCourseDto.title);

      const conflict = await this.prisma.course.findFirst({
        where: {
          id: { not: id },
          slug,
        },
      });

      if (conflict) {
        throw new ConflictException('Another course with this title already exists');
      }
    }

    if (updateCourseDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateCourseDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Invalid categoryId provided');
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        ...updateCourseDto,
        ...(slug && { slug }),
      },
    });
  }

  async remove(id: string, instructorId: string, role: UserRole) {
    const course = await this.findOne(id);

    // Permission check: only ADMIN or the specific instructor
    if (role !== UserRole.ADMIN && course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not have permission to delete this course');
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }
}

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  generateStreamToken(videoUid: string): string {
    const signingKey = process.env.CF_STREAM_SIGNING_KEY || 'hypothetical_cf_stream_signing_key_secret';
    const keyId = process.env.CF_STREAM_KEY_ID || 'hypothetical_key_id';

    const payload = {
      sub: videoUid,
      kid: keyId,
      exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60, // 2 hours expiration
    };

    return jwt.sign(payload, signingKey, {
      algorithm: 'HS256',
      keyid: keyId,
    });
  }

  async getPlaybackToken(id: string, user: any) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    if (!lesson.videoUid) {
      throw new BadRequestException('This lesson does not contain a video');
    }

    const userId = typeof user === 'string' ? user : user?.id;
    if (!userId) {
      throw new ForbiddenException('You do not have access to this course');
    }

    const course = lesson.section.course;

    // Check if user is SUPER_ADMIN
    let isSuperAdmin = false;
    if (user?.role) {
      isSuperAdmin = Boolean(
        user.role.name === 'SUPER_ADMIN' ||
          user.role.permissions?.some(
            (p: any) => p.module === 'ALL' && p.action === 'MANAGE',
          ),
      );
    } else {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: { include: { permissions: true } } },
      });
      isSuperAdmin = Boolean(
        dbUser?.role?.name === 'SUPER_ADMIN' ||
          dbUser?.role?.permissions?.some(
            (p) => p.module === 'ALL' && p.action === 'MANAGE',
          ),
      );
    }

    const isInstructor = course.instructorId === userId;

    // Bypass enrollment check if SUPER_ADMIN or course instructor
    if (!isSuperAdmin && !isInstructor) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
      });

      if (!enrollment || enrollment.status !== 'ACTIVE') {
        throw new ForbiddenException('You do not have access to this course');
      }
    }

    const token = this.generateStreamToken(lesson.videoUid);

    return {
      token,
      videoUid: lesson.videoUid,
    };
  }

  async create(createLessonDto: CreateLessonDto, userId?: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: createLessonDto.sectionId },
      include: { course: true },
    });

    if (!section) {
      throw new BadRequestException('Invalid sectionId provided');
    }

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: { include: { permissions: true } } },
      });
      const isSuperAdmin = user?.role?.permissions?.some(
        (p) => p.module === 'ALL' && p.action === 'MANAGE',
      );
      if (!isSuperAdmin && section.course.instructorId !== userId) {
        throw new ForbiddenException('You do not have permission to add lessons to this section');
      }
    }

    let order = createLessonDto.order;
    if (order === undefined || order === null) {
      const lastLesson = await this.prisma.lesson.findFirst({
        where: { sectionId: createLessonDto.sectionId },
        orderBy: { order: 'desc' },
      });
      order = lastLesson ? lastLesson.order + 1 : 1;
    }

    return this.prisma.lesson.create({
      data: {
        ...createLessonDto,
        order,
      },
    });
  }

  async findAll() {
    return this.prisma.lesson.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        section: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, userId?: string) {
    const lesson = await this.findOne(id);

    if (userId) {
      const section = await this.prisma.section.findUnique({
        where: { id: lesson.sectionId },
        include: { course: true },
      });
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: { include: { permissions: true } } },
      });
      const isSuperAdmin = user?.role?.permissions?.some(
        (p) => p.module === 'ALL' && p.action === 'MANAGE',
      );
      if (!isSuperAdmin && section?.course.instructorId !== userId) {
        throw new ForbiddenException('You do not have permission to update this lesson');
      }
    }

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

  async remove(id: string, userId?: string) {
    const lesson = await this.findOne(id);

    if (userId) {
      const section = await this.prisma.section.findUnique({
        where: { id: lesson.sectionId },
        include: { course: true },
      });
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: { include: { permissions: true } } },
      });
      const isSuperAdmin = user?.role?.permissions?.some(
        (p) => p.module === 'ALL' && p.action === 'MANAGE',
      );
      if (!isSuperAdmin && section?.course.instructorId !== userId) {
        throw new ForbiddenException('You do not have permission to delete this lesson');
      }
    }

    return this.prisma.lesson.delete({
      where: { id },
    });
  }

  async updateProgress(lessonId: string, userId: string, dto: UpdateLessonProgressDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const watchTime = dto.watchTime !== undefined ? Math.round(dto.watchTime) : undefined;

    return this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        ...(watchTime !== undefined && { watchTime }),
        ...(dto.isCompleted !== undefined && { isCompleted: dto.isCompleted }),
      },
      create: {
        userId,
        lessonId,
        watchTime: watchTime ?? 0,
        isCompleted: dto.isCompleted ?? false,
      },
    });
  }
}

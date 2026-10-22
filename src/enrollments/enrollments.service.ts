import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EnrollmentStatus } from '@prisma/client';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /enrollments/my-courses
   * Fetches all active courses for the currently logged-in student (req.user.id).
   * Includes course details (title, thumbnail, instructor name).
   */
  async getMyCourses(userId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        userId,
        status: EnrollmentStatus.ACTIVE,
      },
      select: {
        id: true,
        progress: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            price: true,
            instructor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Check enrollment status for a specific course.
   */
  async getCourseEnrollment(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: {
        id: true,
        progress: true,
        status: true,
        createdAt: true,
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            instructor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment || enrollment.status === EnrollmentStatus.REVOKED) {
      return { isEnrolled: false };
    }

    return {
      isEnrolled: true,
      enrollment,
    };
  }

  /**
   * Update student's course completion progress percentage (0 - 100).
   */
  async updateProgress(userId: string, courseId: string, progress: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('You are not enrolled in this course');
    }

    if (enrollment.status === EnrollmentStatus.REVOKED) {
      throw new ForbiddenException('Your access to this course has been revoked');
    }

    const updatedStatus = progress >= 100 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE;

    return this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        progress,
        status: updatedStatus,
      },
    });
  }

  /**
   * Admin: Retrieve all enrollments across the LMS.
   */
  async getAllEnrollmentsAdmin() {
    return this.prisma.enrollment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            instructor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Update enrollment status (e.g. revoke access or re-activate).
   */
  async updateEnrollmentStatusAdmin(enrollmentId: string, status: EnrollmentStatus) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${enrollmentId} not found`);
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status },
    });
  }
}

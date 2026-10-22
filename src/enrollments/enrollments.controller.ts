import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';

@ApiTags('Enrollments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  /**
   * GET /enrollments/my-courses
   * Fetches all active courses for the currently logged-in student (req.user.id).
   * Includes course details (title, thumbnail, instructor name).
   */
  @Get('my-courses')
  @ApiOperation({ summary: 'Fetches all active courses for the currently logged-in student' })
  @ApiOkResponse({ description: 'List of active enrolled courses with details.' })
  getMyCourses(@Req() req: any) {
    return this.enrollmentsService.getMyCourses(req.user.id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Check if the logged-in user is enrolled in a specific course' })
  @ApiOkResponse({ description: 'Enrollment verification status.' })
  getCourseEnrollment(@Param('courseId') courseId: string, @Req() req: any) {
    return this.enrollmentsService.getCourseEnrollment(req.user.id, courseId);
  }

  @Patch('course/:courseId/progress')
  @ApiOperation({ summary: 'Update progress percentage (0 - 100) for an enrolled course' })
  @ApiOkResponse({ description: 'Course progress updated successfully.' })
  updateProgress(
    @Param('courseId') courseId: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @Req() req: any,
  ) {
    return this.enrollmentsService.updateProgress(
      req.user.id,
      courseId,
      updateProgressDto.progress,
    );
  }

  // ==========================================
  // Admin Operations (Protected with RBAC)
  // ==========================================

  @Get('admin/all')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('USER_MANAGEMENT', 'READ')
  @ApiOperation({ summary: 'Admin: Retrieve all enrollments across the entire platform' })
  @ApiOkResponse({ description: 'List of all platform enrollments.' })
  getAllEnrollmentsAdmin() {
    return this.enrollmentsService.getAllEnrollmentsAdmin();
  }

  @Patch('admin/:enrollmentId/status')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('USER_MANAGEMENT', 'MANAGE')
  @ApiOperation({ summary: 'Admin: Revoke, complete, or activate an enrollment' })
  @ApiOkResponse({ description: 'Enrollment status updated successfully.' })
  updateEnrollmentStatusAdmin(
    @Param('enrollmentId') enrollmentId: string,
    @Body() updateStatusDto: UpdateEnrollmentStatusDto,
  ) {
    return this.enrollmentsService.updateEnrollmentStatusAdmin(
      enrollmentId,
      updateStatusDto.status,
    );
  }
}

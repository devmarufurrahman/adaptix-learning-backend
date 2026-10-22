import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { LessonsService } from './lessons.service.js';
import { CreateLessonDto } from './dto/create-lesson.dto.js';
import { UpdateLessonDto } from './dto/update-lesson.dto.js';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';

@ApiTags('Lessons')
@ApiBearerAuth('JWT-auth')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('COURSE', 'CREATE')
  @ApiOperation({ summary: 'Create a new lesson (Instructor/Admin only)' })
  @ApiCreatedResponse({ description: 'The lesson has been successfully created.' })
  create(@Body() createLessonDto: CreateLessonDto, @Request() req: any) {
    return this.lessonsService.create(createLessonDto, req.user.id);
  }

  @Post(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update student progress for a lesson' })
  @ApiOkResponse({ description: 'The updated or created lesson progress.' })
  updateProgress(
    @Param('id') id: string,
    @Body() updateLessonProgressDto: UpdateLessonProgressDto,
    @Request() req: any,
  ) {
    return this.lessonsService.updateProgress(id, req.user.id, updateLessonProgressDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all lessons (Authenticated)' })
  @ApiOkResponse({ description: 'List of all lessons.' })
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get(':id/play')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get secure video playback token for a lesson (Enrolled Student/Instructor/Admin)' })
  @ApiOkResponse({ description: 'The signed playback token.' })
  play(@Param('id') id: string, @Request() req: any) {
    return this.lessonsService.getPlaybackToken(id, req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific lesson by ID (Authenticated)' })
  @ApiOkResponse({ description: 'The found lesson.' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('COURSE', 'UPDATE')
  @ApiOperation({ summary: 'Update a lesson (Instructor/Admin only)' })
  @ApiOkResponse({ description: 'The lesson has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto, @Request() req: any) {
    return this.lessonsService.update(id, updateLessonDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('COURSE', 'DELETE')
  @ApiOperation({ summary: 'Delete a lesson (Instructor/Admin only)' })
  @ApiOkResponse({ description: 'The lesson has been successfully deleted.' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.lessonsService.remove(id, req.user.id);
  }
}

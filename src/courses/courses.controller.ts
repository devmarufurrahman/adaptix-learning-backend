import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
@ApiTags('Courses')
@ApiBearerAuth('JWT-auth')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('COURSE', 'CREATE')
  @ApiOperation({ summary: 'Create a new course (Instructor/Admin only)' })
  @ApiCreatedResponse({ description: 'The course has been successfully created.' })
  create(@Body() createCourseDto: CreateCourseDto, @Request() req: any) {
    return this.coursesService.create(createCourseDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve all courses' })
  @ApiOkResponse({ description: 'List of all courses.' })
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve a course by ID' })
  @ApiOkResponse({ description: 'The found course.' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('COURSE', 'UPDATE')
  @ApiOperation({ summary: 'Update a course (Instructor/Admin only)' })
  @ApiOkResponse({ description: 'The course has been successfully updated.' })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req: any,
  ) {
    return this.coursesService.update(id, updateCourseDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('COURSE', 'DELETE')
  @ApiOperation({ summary: 'Delete a course (Instructor/Admin only)' })
  @ApiOkResponse({ description: 'The course has been successfully deleted.' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.remove(id, req.user.id);
  }
}

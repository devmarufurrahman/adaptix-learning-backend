import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { SectionsService } from './sections.service.js';
import { CreateSectionDto } from './dto/create-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('COURSE', 'CREATE')
  @ApiOperation({ summary: 'Create a new section (Instructor/Admin only)' })
  @ApiCreatedResponse({ description: 'The section has been successfully created.' })
  create(@Body() createSectionDto: CreateSectionDto, @Request() req: any) {
    return this.sectionsService.create(createSectionDto, req.user.id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all sections for a specific course (Public syllabus preview)' })
  @ApiOkResponse({ description: 'List of sections for the course.' })
  findSectionsByCourse(@Param('courseId') courseId: string) {
    return this.sectionsService.findSectionsByCourse(courseId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all sections (Authenticated)' })
  @ApiOkResponse({ description: 'List of all sections.' })
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific section by ID (Authenticated)' })
  @ApiOkResponse({ description: 'The found section.' })
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('COURSE', 'UPDATE')
  @ApiOperation({ summary: 'Update a section (Instructor/Admin only)' })
  @ApiOkResponse({ description: 'The section has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto, @Request() req: any) {
    return this.sectionsService.update(id, updateSectionDto, req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('COURSE', 'DELETE')
  @ApiOperation({ summary: 'Delete a section (Instructor/Admin only)' })
  @ApiOkResponse({ description: 'The section has been successfully deleted.' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.sectionsService.remove(id, req.user.id);
  }
}

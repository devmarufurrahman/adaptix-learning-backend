import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SectionsService } from './sections.service.js';
import { CreateSectionDto } from './dto/create-section.dto.js';
import { UpdateSectionDto } from './dto/update-section.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';

@ApiTags('Sections')
@ApiBearerAuth('JWT-auth')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('COURSE', 'CREATE')
  @ApiOperation({ summary: 'Create a new section' })
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(createSectionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all sections' })
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all sections for a specific course (including lessons)' })
  findSectionsByCourse(@Param('courseId') courseId: string) {
    return this.sectionsService.findSectionsByCourse(courseId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific section by ID' })
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('COURSE', 'UPDATE')
  @ApiOperation({ summary: 'Update a section' })
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('COURSE', 'UPDATE')
  @ApiOperation({ summary: 'Delete a section' })
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }
}

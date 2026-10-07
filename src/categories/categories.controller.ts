import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';
@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('CATEGORY', 'MANAGE')
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiCreatedResponse({ description: 'The category has been successfully created.' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve all categories' })
  @ApiOkResponse({ description: 'List of all categories.' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve a category by ID' })
  @ApiOkResponse({ description: 'The found category.' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('CATEGORY', 'MANAGE')
  @ApiOperation({ summary: 'Update a category (Admin only)' })
  @ApiOkResponse({ description: 'The category has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('CATEGORY', 'MANAGE')
  @ApiOperation({ summary: 'Delete a category (Admin only)' })
  @ApiOkResponse({ description: 'The category has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}

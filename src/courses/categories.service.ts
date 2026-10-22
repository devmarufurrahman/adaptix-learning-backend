import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = this.generateSlug(createCategoryDto.name);

    const existingCategory = await this.prisma.category.findFirst({
      where: {
        OR: [{ name: createCategoryDto.name }, { slug }],
      },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name or slug already exists');
    }

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { courses: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            thumbnail: true,
            createdAt: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    let slug: string | undefined;

    if (updateCategoryDto.name) {
      slug = this.generateSlug(updateCategoryDto.name);

      const conflict = await this.prisma.category.findFirst({
        where: {
          id: { not: id },
          OR: [
            { name: updateCategoryDto.name },
            { slug },
          ],
        },
      });

      if (conflict) {
        throw new ConflictException('Another category with this name or slug already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(updateCategoryDto.name && { name: updateCategoryDto.name }),
        ...(slug && { slug }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const coursesCount = await this.prisma.course.count({
      where: { categoryId: id },
    });

    if (coursesCount > 0) {
      throw new BadRequestException('Cannot delete category with associated courses');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}

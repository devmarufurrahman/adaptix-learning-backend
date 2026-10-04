import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id); // Throws if not found

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
        throw new ConflictException('Another category with this name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        ...(slug && { slug }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Throws if not found

    // Note: If you want to check if courses are attached to prevent deletion,
    // you would add a check here against this.prisma.course.findFirst({ where: { categoryId: id }})
    return this.prisma.category.delete({
      where: { id },
    });
  }
}

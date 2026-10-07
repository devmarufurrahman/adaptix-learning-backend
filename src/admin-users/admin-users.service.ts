import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAdminUserDto } from './dto/create-admin-user.dto.js';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async createAdminUser(dto: CreateAdminUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        roleId: dto.roleId,
        isProfileComplete: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
          }
        },
        createdAt: true,
      }
    });

    return user;
  }

  async updateRolePermissions(roleId: string, dto: UpdateRolePermissionsDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Atomic update: Delete old permissions and insert new ones
    await this.prisma.$transaction([
      this.prisma.permission.deleteMany({
        where: { roleId },
      }),
      this.prisma.permission.createMany({
        data: dto.permissions.map(p => ({
          module: p.module,
          action: p.action,
          roleId: roleId,
        })),
        skipDuplicates: true,
      })
    ]);

    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: true },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany({
      include: { permissions: true },
    });
  }
}

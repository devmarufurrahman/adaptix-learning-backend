import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAdminUserDto } from './dto/create-admin-user.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // --- Admin Operations ---

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
        role: { select: { name: true } },
        createdAt: true,
      }
    });

    return user;
  }

  async updateUserRole(userId: string, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId: dto.roleId },
      select: {
        id: true,
        name: true,
        email: true,
        role: { select: { name: true } },
      }
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany({
      include: { permissions: true },
    });
  }

  // --- Standard User Operations (Public/Own Profile) ---

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        image: true,
        isProfileComplete: true,
        role: { select: { name: true, permissions: true } }
      }
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

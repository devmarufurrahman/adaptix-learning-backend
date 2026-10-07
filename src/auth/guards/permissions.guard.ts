import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator.js';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true; // No permissions required, pass to next guard
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role || !user.role.permissions) {
      throw new ForbiddenException('User identity or role not found');
    }

    const role = user.role;

    // Check for SUPER_ADMIN access (MANAGE ALL)
    const isSuperAdmin = role.permissions.some(
      (p: Permission) => p.module === 'ALL' && p.action === 'MANAGE'
    );

    if (isSuperAdmin) {
      return true;
    }

    // Check for the specific required permission
    const hasPermission = role.permissions.some(
      (p: Permission) => p.module === requiredPermission.module && p.action === requiredPermission.action
    );

    if (!hasPermission) {
      throw new ForbiddenException(`Insufficient permissions. Required: ${requiredPermission.action} on ${requiredPermission.module}`);
    }

    return true;
  }
}

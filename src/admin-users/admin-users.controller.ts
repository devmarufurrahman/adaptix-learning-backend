import { Controller, Post, Body, Patch, Param, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service.js';
import { CreateAdminUserDto } from './dto/create-admin-user.dto.js';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';

@ApiTags('Admin Users & Roles')
@ApiBearerAuth('JWT-auth')
@Controller('admin-users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('USER_MANAGEMENT', 'MANAGE')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new Admin or Instructor account' })
  createAdminUser(@Body() createAdminUserDto: CreateAdminUserDto) {
    return this.adminUsersService.createAdminUser(createAdminUserDto);
  }

  @Patch('roles/:id/permissions')
  @ApiOperation({ summary: 'Update (add/remove) permissions for a specific role' })
  updateRolePermissions(
    @Param('id') id: string,
    @Body() updateRolePermissionsDto: UpdateRolePermissionsDto,
  ) {
    return this.adminUsersService.updateRolePermissions(id, updateRolePermissionsDto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'List all roles and their attached permissions' })
  getAllRoles() {
    return this.adminUsersService.getAllRoles();
  }
}

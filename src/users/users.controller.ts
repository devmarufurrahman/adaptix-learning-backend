import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { CreateAdminUserDto } from './dto/create-admin-user.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../auth/decorators/permissions.decorator.js';

@ApiTags('Users & Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- Standard User Endpoints (No specific permissions required, just login) ---

  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  getMe(@Request() req: any) {
    return this.usersService.getMe(req.user.id);
  }

  // --- Admin Endpoints (Require PermissionsGuard) ---

  @Post('admin/create')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('USER_MANAGEMENT', 'CREATE')
  @ApiOperation({ summary: 'Create a new Admin or Instructor account' })
  createAdminUser(@Body() createAdminUserDto: CreateAdminUserDto) {
    return this.usersService.createAdminUser(createAdminUserDto);
  }

  @Patch('admin/:userId/role')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('USER_MANAGEMENT', 'UPDATE')
  @ApiOperation({ summary: 'Change a specific user\'s role' })
  updateUserRole(
    @Param('userId') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(userId, updateUserRoleDto);
  }

  @Get('admin/roles')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('USER_MANAGEMENT', 'READ')
  @ApiOperation({ summary: 'List all roles and their attached permissions' })
  getAllRoles() {
    return this.usersService.getAllRoles();
  }
}

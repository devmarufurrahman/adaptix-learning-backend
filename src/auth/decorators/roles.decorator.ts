import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const REQUIRE_ROLES = 'REQUIRE_ROLES';
export const Roles = (...roles: UserRole[]) => SetMetadata(REQUIRE_ROLES, roles);

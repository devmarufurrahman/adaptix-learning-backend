import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
  module: string;
  action: string;
}

export const RequirePermissions = (module: string, action: string) =>
  SetMetadata(PERMISSIONS_KEY, { module, action } as RequiredPermission);

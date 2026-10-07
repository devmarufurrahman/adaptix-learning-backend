import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ example: 'uuid-of-role' })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}

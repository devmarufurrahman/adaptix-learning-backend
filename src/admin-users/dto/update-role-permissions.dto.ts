import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PermissionDto {
  @ApiProperty({ example: 'COURSE' })
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty({ example: 'CREATE' })
  @IsString()
  @IsNotEmpty()
  action: string;
}

export class UpdateRolePermissionsDto {
  @ApiProperty({ type: [PermissionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}

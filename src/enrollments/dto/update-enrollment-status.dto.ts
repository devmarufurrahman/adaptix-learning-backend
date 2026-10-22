import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

export class UpdateEnrollmentStatusDto {
  @ApiProperty({
    enum: EnrollmentStatus,
    example: EnrollmentStatus.ACTIVE,
    description: 'Updated enrollment access status (ACTIVE, COMPLETED, REVOKED)',
  })
  @IsEnum(EnrollmentStatus, { message: 'status must be a valid EnrollmentStatus (ACTIVE, COMPLETED, REVOKED)' })
  @IsNotEmpty({ message: 'status is required' })
  status: EnrollmentStatus;
}

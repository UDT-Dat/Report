import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PermissionType } from '../models/permission.model';

export class UpdatePermissionDto {
  @ApiProperty({
    description: 'The type of permission to update to',
    enum: PermissionType,
    default: PermissionType.READ,
  })
  @IsEnum(PermissionType)
  @IsOptional()
  type: PermissionType;
}

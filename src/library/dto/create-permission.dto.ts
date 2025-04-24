import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PermissionType } from '../models/permission.model';

export class CreatePermissionDto {
  @ApiProperty({ description: 'The user ID who will have access' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'The type of permission', enum: PermissionType, default: PermissionType.READ })
  @IsEnum(PermissionType)
  type: PermissionType = PermissionType.READ;
} 
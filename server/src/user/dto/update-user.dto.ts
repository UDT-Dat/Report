import { IsDate, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { UserRole, UserStatus } from '../user.model';

export class UpdateUserDto {
  @ApiProperty({ description: 'The full name of the user', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The email address of the user',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'The phone number of the user', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'The address of the user', required: false })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateUserByIdDto extends UpdateUserDto {
  @ApiProperty({ description: 'The role of the user', required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ description: 'The status of the user', required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    description: 'The student code of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiProperty({
    description: 'The avatar URL of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  studentCard?: string;

  @ApiProperty({
    description: 'The ID of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsDate()
  @ApiProperty({
    description: 'The last login timestamp of the user',
    required: false,
  })
  lastLogin?: Date;
}
export class UpdateUserPasswordDto {
  @ApiProperty({ description: 'The password of the user', required: false })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({ description: 'The new password of the user', required: false })
  @IsOptional()
  @IsString()
  newPassword?: string;

  @ApiProperty({
    description: 'The confirm password of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  confirmPassword?: string;
}

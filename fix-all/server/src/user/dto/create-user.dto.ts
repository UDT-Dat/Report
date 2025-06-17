import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole, UserStatus } from '../user.model';

export class CreateUserDto {
  @ApiProperty({ description: 'The full name of the user' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email address of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: 'The phone number of the user', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'The address of the user', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    enum: UserRole,
    description: 'The role of the user',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    enum: UserStatus,
    description: 'The status of the user',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    description: 'The ID of the user who created this user',
    required: false,
  })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiProperty({
    description: 'The course of the user',
    required: false,
  })
  @IsOptional()
  course?: string;

  @IsOptional()
  @ApiProperty({
    description: 'The student card image file',
    required: false,
  })
  studentCard?: string;
}

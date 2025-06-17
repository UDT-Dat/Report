import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from 'src/user/dto/list-response.dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserParticipationStatus {
  GRANTED = 'granted',
  NOT_GRANTED = 'not_granted',
}

export class GetLibraryUsersDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search by user name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by participation status',
    enum: UserParticipationStatus,
  })
  @IsOptional()
  @IsEnum(UserParticipationStatus)
  status?: UserParticipationStatus;
}

export class LibraryUserResponse {
  @ApiProperty({ description: 'User ID' })
  _id: string;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User avatar' })
  avatar?: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'Whether user has access to this library' })
  hasAccess: boolean;

  @ApiProperty({ description: 'Permission details if user has access' })
  permission?: {
    _id: string;
    grantedBy: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  };
}

export class LibraryUsersResponseDto {
  @ApiProperty({ type: [LibraryUserResponse] })
  users: LibraryUserResponse[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

import { User } from 'src/user/user.model';

import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class UserListResponseDto {
  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;

  @ApiProperty({ type: [User] })
  users: User[];
}

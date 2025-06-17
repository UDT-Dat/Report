import { Library } from 'src/library/models/library.model';

import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class LibraryListResponseDto {
  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;

  @ApiProperty({ type: [Library] })
  libraries: Library[];
}

import { Event } from 'src/event/event.model';

import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class EventListResponseDto {
  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;

  @ApiProperty({ type: [Event] })
  events: Event[];
}

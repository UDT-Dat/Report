import { ApiProperty } from '@nestjs/swagger';

export class MonthlyStatsItemDto {
  @ApiProperty({
    example: 120,
    description: 'Số lượng bản ghi trong tháng hiện tại',
  })
  currentMonth: number;

  @ApiProperty({
    example: 100,
    description: 'Số lượng bản ghi trong tháng trước',
  })
  prevMonth: number;

  @ApiProperty({
    example: '+20.0%',
    description: 'Tỷ lệ thay đổi so với tháng trước',
  })
  ratio: string;

  @ApiProperty({
    example: 500,
    description: 'Tổng số bản ghi từ trước tới nay',
  })
  total: number;
}

export class MonthlyStatsDto {
  @ApiProperty({
    type: MonthlyStatsItemDto,
    description: 'Thống kê User',
  })
  User: MonthlyStatsItemDto;

  @ApiProperty({
    type: MonthlyStatsItemDto,
    description: 'Thống kê Post',
  })
  Post: MonthlyStatsItemDto;

  @ApiProperty({
    type: MonthlyStatsItemDto,
    description: 'Thống kê Event',
  })
  Event: MonthlyStatsItemDto;

  @ApiProperty({
    type: MonthlyStatsItemDto,
    description: 'Thống kê Library',
  })
  Library: MonthlyStatsItemDto;
}

import { ApiProperty } from '@nestjs/swagger';
import { RecentRecordsDto } from './recent-records.dto';
import { MonthlyStatsDto } from './monthly-stats.dto';

export class CombinedStatsDto {
  @ApiProperty({
    type: RecentRecordsDto,
    description: '5 bản ghi mới nhất từ mỗi model',
  })
  recentRecords: RecentRecordsDto;

  @ApiProperty({
    type: MonthlyStatsDto,
    description: 'Thống kê tháng hiện tại so với tháng trước',
  })
  monthlyStats: MonthlyStatsDto;
}

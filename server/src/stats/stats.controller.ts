import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { RecentRecordsDto } from './dto/recent-records.dto';
import { MonthlyStatsDto } from './dto/monthly-stats.dto';
import { CombinedStatsDto } from './dto/combined-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.model';

@ApiTags('Stats')
@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.BOD)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('recent-records')
  @ApiOperation({
    summary: 'Get 5 most recent records from each model (Admin/BOD only)',
    description:
      'Truy xuất 5 bản ghi mới nhất từ mỗi model (User, Post, Event, Permission) và liên kết các bảng lại với nhau, sắp xếp theo thời gian tạo. Chỉ Admin và BOD mới có thể truy cập.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved recent records',
    type: RecentRecordsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or BOD role required',
  })
  async getRecentRecords(): Promise<RecentRecordsDto> {
    return await this.statsService.getRecentRecords();
  }

  @Get('monthly-comparison')
  @ApiOperation({
    summary: 'Get monthly statistics comparison (Admin/BOD only)',
    description:
      'Tính toán và trả về số lượng bản ghi mới trong tháng hiện tại so với tháng trước cho các model: User, Post, Event, Library. Chỉ Admin và BOD mới có thể truy cập.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved monthly statistics',
    type: MonthlyStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or BOD role required',
  })
  async getMonthlyStats(): Promise<MonthlyStatsDto> {
    return await this.statsService.getMonthlyStats();
  }

  @Get('combined')
  @ApiOperation({
    summary: 'Get combined statistics (Admin/BOD only)',
    description:
      'Trả về cả thông tin 5 bản ghi mới nhất và thống kê tháng hiện tại so với tháng trước trong một API call. Chỉ Admin và BOD mới có thể truy cập.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved combined statistics',
    type: CombinedStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or BOD role required',
  })
  async getCombinedStats(): Promise<CombinedStatsDto> {
    return await this.statsService.getCombinedStats();
  }
}

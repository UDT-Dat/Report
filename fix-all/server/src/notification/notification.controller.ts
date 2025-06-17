import { QueryValidationPipe } from 'src/common/pipes/query-validation.pipe';

import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Notification } from './notification.model';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  private readonly notificationQueryPipe: QueryValidationPipe;
  constructor(
    private readonly notificationService: NotificationService,
    private readonly jwtService: JwtService,
  ) {
    this.notificationQueryPipe = new QueryValidationPipe(
      ['isRead'], // allowedAttributes
      [], // allowedOperators (giới hạn chỉ cho phép một số toán tử)
      ['isRead'], // eqOnlyFields (status chỉ được dùng với toán tử eq)
    );
  }

  @Get('debug/token')
  @ApiOperation({ summary: 'Debug JWT token for WebSocket connection' })
  async debugToken(@Request() req) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return { error: 'No token provided' };
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.userId;

      return {
        tokenValid: true,
        userId: userId,
        payload: payload,
        tokenPreview: token.substring(0, 20) + '...',
      };
    } catch (error) {
      return {
        tokenValid: false,
        error: error.message,
        stack: error.stack,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get notifications for authenticated user' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  async findAll(@Request() req, @Query() query) {
    return this.notificationService.findAllForUser(req.user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by id' })
  @ApiResponse({
    status: 200,
    description: 'Notification details',
    type: Notification,
  })
  async findOne(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.findOne(id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Post('mark-all-read')
  @ApiOperation({
    summary: 'Mark all notifications as read for authenticated user',
  })
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.userId);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<Notification> {
    return this.notificationService.remove(id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Event } from './event.model';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.model';

@ApiTags('Events')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Get()
  @ApiOperation({ summary: 'Get all events with pagination' })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of events retrieved successfully',
    type: Event,
    isArray: true,
  })
  findAll(@Query('size') size: number, @Query('page') page: number) {
    return this.eventService.findAll({
      size, page
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event found successfully',
    type: Event,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: Event,
  })
  async create(@Body() createEventDto: CreateEventDto, @Request() req): Promise<Event> {
    return this.eventService.create(createEventDto, req.user);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an existing event' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: Event,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req
  ): Promise<Event> {
    return this.eventService.update(id, updateEventDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id') id: string, @Request() req): Promise<Event> {
    return this.eventService.remove(id, req.user);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an event' })
  @ApiResponse({ status: 200, description: 'Joined event successfully', type: Event })
  async joinEvent(@Param('id') id: string, @Request() req): Promise<Event> {
    return this.eventService.joinEvent(id, req.user);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave an event' })
  @ApiResponse({ status: 200, description: 'Left event successfully', type: Event })
  async leaveEvent(@Param('id') id: string, @Request() req): Promise<Event> {
    return this.eventService.leaveEvent(id, req.user);
  }
}

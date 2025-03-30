import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Event } from './event.model';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

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
    return this.eventService.findAll(size, page);
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
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: Event,
  })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing event' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: Event,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  delete(@Param('id') id: string) {
    return this.eventService.delete(id);
  }
}

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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseFilters,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Event } from './event.model';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.model';
import { MulterExceptionFilter } from 'src/common/filters/multer-exception.filter';
import { RemoveFileFieldInterceptor } from 'src/common/interceptors/remove-file-field.interceptor';
import { QueryValidationPipe } from 'src/common/pipes/query-validation.pipe';

@ApiTags('Events')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventController {
  private readonly eventQueryPipe: QueryValidationPipe;
  constructor(private readonly eventService: EventService) {
    this.eventQueryPipe = new QueryValidationPipe(
      ["title","description", "startDate", "endDate", "maxParticipants"], // allowedAttributes
      [], // allowedOperators (giới hạn chỉ cho phép một số toán tử)
      ["title", "description", "location", "startDate", "endDate", "maxParticipants"] // eqOnlyFields (status chỉ được dùng với toán tử eq)
    );
  }


  @Get()
  @ApiOperation({ summary: 'Get all events with pagination' })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Filter query in JSON format or query string format. Examples: {"username_like":"john"} or username_like=john&email=test@example.com',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'List of events retrieved successfully',
    type: Event,
    isArray: true,
  })
  async findAll(@Query() query: any) {
    const validatedQuery = await this.eventQueryPipe.transform(query.filter);
    return this.eventService.findAll(validatedQuery);
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
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        // Kiểm tra loại file có phải là hình ảnh không
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed (jpg, jpeg, png, gif)'),
            false
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Create a new event' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        location: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        maxParticipants: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: Event,
  })
  async create(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ): Promise<Event> {
    if (!file) {
      throw new BadRequestException('Image file is required for event creation');
    }
    return this.eventService.create({
      ...createEventDto,
    }, file.path, req.user);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(RemoveFileFieldInterceptor)
  @ApiOperation({ summary: 'Update an existing event' })
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file) {
          return cb(null, true);
        }
        // Kiểm tra loại file có phải là hình ảnh không
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed (jpg, jpeg, png, gif)'),
            false
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        location: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        maxParticipants: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: Event,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Event> {
    if (file && typeof file === 'string') {
      file = undefined;
    }
    return this.eventService.update(id, updateEventDto, file, req.user);
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

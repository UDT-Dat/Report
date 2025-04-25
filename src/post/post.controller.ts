import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, UseInterceptors, UploadedFiles, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './post.model';
import { UserRole } from '../user/user.model';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BannerImageInterceptor } from './interceptors/banner-image.interceptor';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'bannerImage', maxCount: 1 },
      { name: 'attachments', maxCount: 10 },
    ], {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
      },
      fileFilter: (req, file, cb) => {
        console.log(file)
        if (!file || typeof file === 'string') {
          return cb(null, true);
        }
        if (file.fieldname === 'bannerImage') {
          if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
            return cb(
              new BadRequestException('Only image files are allowed (jpg, jpeg, png, gif)'),
              false
            );
          }
        }
        cb(null, true);
      },
    })
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bannerImage: { type: 'string', format: 'binary' },
        attachments: { type: 'array', items: { type: 'string', format: 'binary' } },
        title: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['bannerImage', 'title', 'content'],
    },
  })
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully', type: PostEntity })
  async create(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
    @UploadedFiles() files: { bannerImage: Express.Multer.File[], attachments?: Express.Multer.File[] },
  ): Promise<PostEntity> {
    if (!files.bannerImage || files.bannerImage.length === 0) {
      throw new BadRequestException('Banner image is required');
    }

    const bannerImage = files.bannerImage[0];
    const attachments = files.attachments || [];

    // Remove attachments property from DTO to avoid validation errors
    const { ...dtoWithoutAttachments } = createPostDto;

    return this.postService.create(dtoWithoutAttachments, req.user, bannerImage, attachments);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'List of all posts', type: [PostEntity] })
  async findAll(): Promise<PostEntity[]> {
    return this.postService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by id' })
  @ApiResponse({ status: 200, description: 'Post details', type: PostEntity })
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'bannerImage', maxCount: 1 },
      { name: 'attachments', maxCount: 10 },
    ], {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
      },
      fileFilter: (req, file, cb) => {
        if (!file || typeof file === 'string') {
          return cb(null, true);
        }
        if (file.fieldname === 'bannerImage') {
          if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
            return cb(
              new BadRequestException('Only image files are allowed (jpg, jpeg, png, gif)'),
              false
            );
          }
        }
        cb(null, true);
      },
    })
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bannerImage: { type: 'string', format: 'binary' },
        attachments: { type: 'array', items: { type: 'string', format: 'binary' } },
        title: { type: 'string' },
        content: { type: 'string' },
        removeAttachments: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      },
    },
  })
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully', type: PostEntity })
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
    @UploadedFiles() files: { bannerImage?: Express.Multer.File[], attachments?: Express.Multer.File[] }
  ): Promise<PostEntity> {
    const bannerImage = files?.bannerImage ? files.bannerImage[0] : undefined;
    const attachments = files.attachments || [];
    return this.postService.update(id, req.user, updatePostDto, bannerImage, attachments);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  async remove(@Param('id') id: string, @Request() req): Promise<PostEntity> {
    return this.postService.remove(id, req.user);
  }
} 
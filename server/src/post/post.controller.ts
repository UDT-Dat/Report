import { QueryValidationPipe } from 'src/common/pipes/query-validation.pipe';

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtService } from '@nestjs/jwt';
import { toObjectId } from 'src/common/utils';
import { User } from 'src/user/user.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity, PostStatus } from './post.model';
import { PostService } from './post.service';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  private readonly postQueryPipe: QueryValidationPipe;
  constructor(
    private readonly postService: PostService,
    private readonly jwtService: JwtService,
  ) {
    this.postQueryPipe = new QueryValidationPipe(
      ['title', 'content', 'updatedAt', 'createdAt', 'createdBy'], // allowedAttributes
      [], // allowedOperators (giới hạn chỉ cho phép một số toán tử)
      ['createdBy', 'updatedAt', 'createdAt'], // eqOnlyFields (status chỉ được dùng với toán tử eq)
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'bannerImage', maxCount: 1 },
        { name: 'attachments', maxCount: 10 },
      ],
      {
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
        fileFilter: (req, file, cb) => {
          if (!file || typeof file === 'string') {
            return cb(null, true);
          }
          if (
            file.fieldname === 'bannerImage' &&
            !file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)
          ) {
            return cb(
              new BadRequestException(
                'Only image files are allowed (jpg, jpeg, png, gif)',
              ),
              false,
            );
          }
          cb(null, true);
        },
      },
    ),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bannerImage: { type: 'string', format: 'binary' },
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        title: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['bannerImage', 'title', 'content'],
    },
  })
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    type: PostEntity,
  })
  async create(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
    @UploadedFiles()
    files: {
      bannerImage: Express.Multer.File[];
      attachments?: Express.Multer.File[];
    },
  ): Promise<PostEntity> {
    if (!files.bannerImage || files.bannerImage.length === 0) {
      throw new BadRequestException('Banner image is required');
    }

    const bannerImage = files.bannerImage[0];
    const attachments = files.attachments || [];

    // Remove attachments property from DTO to avoid validation errors
    const { ...dtoWithoutAttachments } = createPostDto;

    return this.postService.create(
      dtoWithoutAttachments,
      req.user,
      bannerImage,
      attachments,
    );
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all posts' })
  @ApiQuery({
    name: 'filter',
    required: false,
    description:
      'Filter query in JSON format or query string format. Examples: {"page":1,"limit":10,"createdBy":"66511d24f032392d90a61063"} or page=1&limit=10&createdBy=66511d24f032392d90a61063',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all posts',
    type: [PostEntity],
  })
  async findAll(
    @Query() query: any,
    @Req() req: any,
  ): Promise<{
    posts: PostEntity[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const validatedQuery = await this.postQueryPipe.transform(query);
    return await this.postService.findAll(validatedQuery, req['user']);
  }

  @Get('home/priority')
  @ApiOperation({ summary: 'Get all priority posts' })
  @ApiQuery({
    name: 'filter',
    required: false,
    description:
      'Filter query in JSON format or query string format. Examples: {"page":1,"limit":10,"createdBy":"66511d24f032392d90a61063"} or page=1&limit=10&createdBy=66511d24f032392d90a61063',
    type: String,
  })
  async findAllPriority(@Query() query: any): Promise<{
    posts: PostEntity[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const validatedQuery = await this.postQueryPipe.transform(query);
    return await this.postService.getPriorityPosts(validatedQuery);
  }

  @Get()
  @ApiOperation({ summary: 'Get all public posts' })
  @ApiQuery({
    name: 'filter',
    required: false,
    description:
      'Filter query in JSON format or query string format. Examples: {"page":1,"limit":10} or page=1&limit=10',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all public posts',
    type: [PostEntity],
  })
  async findAllPublic(
    @Query() query: any,
    @Req() req: any,
  ): Promise<{
    posts: PostEntity[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const token = req.headers.authorization?.split(' ')[1];
    let user: User | undefined = undefined;
    if (token) {
      const data = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET
          ? process.env.JWT_SECRET
          : 'your-secret-key',
      });
      user = {
        _id: toObjectId(data.sub),
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
      } as User;
    }
    const validatedQuery = await this.postQueryPipe.transform(query);
    return await this.postService.findAll(validatedQuery, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by id' })
  @ApiResponse({ status: 200, description: 'Post details', type: PostEntity })
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'bannerImage', maxCount: 1 },
        { name: 'attachments', maxCount: 10 },
      ],
      {
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
                new BadRequestException(
                  'Only image files are allowed (jpg, jpeg, png, gif)',
                ),
                false,
              );
            }
          }
          cb(null, true);
        },
      },
    ),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bannerImage: { type: 'string', format: 'binary' },
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        title: { type: 'string' },
        content: { type: 'string' },
        removeAttachments: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
    type: PostEntity,
  })
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
    @UploadedFiles()
    files: {
      bannerImage?: Express.Multer.File[];
      attachments?: Express.Multer.File[];
    },
  ): Promise<PostEntity> {
    const bannerImage = files?.bannerImage ? files.bannerImage[0] : undefined;
    const attachments = files.attachments || [];
    return this.postService.update(
      id,
      req.user,
      updatePostDto,
      bannerImage,
      attachments,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  async remove(@Param('id') id: string, @Request() req): Promise<PostEntity> {
    return this.postService.remove(id, req.user);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post status' })
  @ApiResponse({
    status: 200,
    description: 'Post status updated successfully',
    type: PostEntity,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: PostStatus,
    @Request() req,
    @Body('rejectReason') rejectReason?: string,
  ): Promise<PostEntity> {
    if (!status) {
      throw new BadRequestException('Status is required');
    }
    return this.postService.updateStatus(
      id,
      {
        status,
        rejectReason,
      },
      req['user'] as User,
    );
  }

  @Put(':id/priority')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post priority' })
  @ApiResponse({
    status: 200,
    description: 'Post priority updated successfully',
    type: PostEntity,
  })
  async updatePriority(
    @Param('id') id: string,
    @Body('priority') priority: boolean,
  ): Promise<PostEntity> {
    if (priority === undefined || priority === null) {
      throw new BadRequestException('Priority is required');
    }
    return this.postService.updatePriority(id, priority);
  }
}

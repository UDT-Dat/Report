import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { PostStatus } from './models/post.model';
import { MediaType } from './models/media.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { User } from '../auth/user.model';
import { Client } from '@microsoft/microsoft-graph-client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { Library } from './library.model';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.model';

@ApiTags('Library')
@Controller('library')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  // Post endpoints
  @Post('posts')
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UserDecorator() user: User,
  ) {
    return this.libraryService.createPost(
      createPostDto.title,
      createPostDto.content,
      user,
      createPostDto.attachments,
    );
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get all posts' })
  async getPosts(@Query('status') status?: PostStatus) {
    return this.libraryService.getPosts(status);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get post by ID' })
  async getPost(@Param('id') id: string) {
    return this.libraryService.getPostById(id);
  }

  @Put('posts/:id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UserDecorator() user: User,
  ) {
    return this.libraryService.updatePost(id, user, updatePostDto);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  async deletePost(@Param('id') id: string, @UserDecorator() user: User) {
    return this.libraryService.deletePost(id, user);
  }

  @Put('posts/:id/approve')
  @ApiOperation({ summary: 'Approve a post' })
  async approvePost(@Param('id') id: string, @UserDecorator() user: User) {
    return this.libraryService.approvePost(id, user);
  }

  // Media endpoints
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload media file' })
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: MediaType,
    @UserDecorator() user: User,
    @Body('description') description?: string,
  ) {
    return this.libraryService.uploadMedia(file, type, user, description);
  }

  @Get('media')
  @ApiOperation({ summary: 'Get all media files' })
  async getMediaFiles(@Query('type') type?: MediaType) {
    return this.libraryService.getMediaFiles(type);
  }

  @Get('media/:id')
  @ApiOperation({ summary: 'Get media by ID' })
  async getMedia(@Param('id') id: string) {
    return this.libraryService.getMediaById(id);
  }

  @Delete('media/:id')
  @ApiOperation({ summary: 'Delete media' })
  async deleteMedia(@Param('id') id: string, @UserDecorator() user: User) {
    return this.libraryService.deleteMedia(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new library resource' })
  @ApiResponse({ status: 201, description: 'Resource created successfully', type: Library })
  async createLibraryResource(@Body() createLibraryDto: CreateLibraryDto, @Request() req): Promise<Library> {
    return this.libraryService.create(createLibraryDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accessible library resources' })
  @ApiResponse({ status: 200, description: 'List of accessible resources', type: [Library] })
  async findAllLibraryResources(@Request() req): Promise<Library[]> {
    return this.libraryService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a library resource by id' })
  @ApiResponse({ status: 200, description: 'Resource details', type: Library })
  async findLibraryResource(@Param('id') id: string, @Request() req): Promise<Library> {
    return this.libraryService.findOne(id, req.user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a library resource' })
  @ApiResponse({ status: 200, description: 'Resource updated successfully', type: Library })
  async updateLibraryResource(
    @Param('id') id: string, 
    @Body() updateLibraryDto: UpdateLibraryDto,
    @Request() req
  ): Promise<Library> {
    return this.libraryService.update(id, updateLibraryDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a library resource' })
  @ApiResponse({ status: 200, description: 'Resource deleted successfully' })
  async removeLibraryResource(@Param('id') id: string, @Request() req): Promise<Library> {
    return this.libraryService.remove(id, req.user);
  }

  @Put(':id/grant-access/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Grant access to a user' })
  @ApiResponse({ status: 200, description: 'Access granted successfully', type: Library })
  async grantAccess(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req
  ): Promise<Library> {
    return this.libraryService.grantAccess(id, userId, req.user);
  }

  @Put(':id/revoke-access/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiOperation({ summary: 'Revoke access from a user' })
  @ApiResponse({ status: 200, description: 'Access revoked successfully', type: Library })
  async revokeAccess(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req
  ): Promise<Library> {
    return this.libraryService.revokeAccess(id, userId, req.user);
  }
}

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
  ApiConsumes,
} from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { User } from '../auth/user.model';
import { Client } from '@microsoft/microsoft-graph-client';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { Library } from './models/library.model';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.model';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Attachment } from './models/attachment.model';
import { Permission } from './models/permission.model';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@ApiTags('Library')
@Controller('library')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}


  // Library endpoints
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new library (admin only)' })
  @ApiResponse({ status: 201, description: 'Library created successfully', type: Library })
  async createLibrary(
    @Body() createLibraryDto: CreateLibraryDto, 
    @UserDecorator() user: User
  ): Promise<Library> {
    return this.libraryService.createLibrary(createLibraryDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accessible libraries' })
  @ApiResponse({ status: 200, description: 'List of accessible libraries', type: [Library] })
  async findAllLibraries(@UserDecorator() user: User): Promise<Library[]> {
    return this.libraryService.findAllLibraries(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a library by id' })
  @ApiResponse({ status: 200, description: 'Library details', type: Library })
  async findLibrary(@Param('id') id: string, @UserDecorator() user: User): Promise<Library> {
    return this.libraryService.findLibraryById(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a library' })
  @ApiResponse({ status: 200, description: 'Library updated successfully', type: Library })
  async updateLibrary(
    @Param('id') id: string, 
    @Body() updateLibraryDto: UpdateLibraryDto,
    @UserDecorator() user: User
  ): Promise<Library> {
    return this.libraryService.updateLibrary(id, updateLibraryDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a library' })
  @ApiResponse({ status: 200, description: 'Library deleted successfully' })
  async deleteLibrary(@Param('id') id: string, @UserDecorator() user: User): Promise<void> {
    return this.libraryService.deleteLibrary(id, user);
  }

  // Attachment endpoints
  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an attachment to a library' })
  @ApiResponse({ status: 201, description: 'Attachment uploaded successfully', type: Attachment })
  async uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createAttachmentDto: CreateAttachmentDto,
    @UserDecorator() user: User,
  ): Promise<Attachment> {
    // Override libraryId with the path param
    createAttachmentDto.libraryId = id;
    return this.libraryService.uploadAttachment(file, createAttachmentDto, user);
  }

  @Get(':id/attachments')
  @ApiOperation({ summary: 'Get all attachments in a library' })
  @ApiResponse({ status: 200, description: 'List of attachments', type: [Attachment] })
  async getAttachments(@Param('id') id: string, @UserDecorator() user: User): Promise<Attachment[]> {
    return this.libraryService.getAttachmentsByLibrary(id, user);
  }

  @Delete('attachments/:id')
  @ApiOperation({ summary: 'Delete an attachment' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  async deleteAttachment(@Param('id') id: string, @UserDecorator() user: User): Promise<void> {
    return this.libraryService.deleteAttachment(id, user);
  }

  // Permission endpoints
  @Post(':id/permissions')
  @ApiOperation({ summary: 'Grant permission to a user for a library' })
  @ApiResponse({ status: 201, description: 'Permission granted successfully', type: Permission })
  async createPermission(
    @Param('id') id: string,
    @Body() createPermissionDto: CreatePermissionDto,
    @UserDecorator() user: User,
  ): Promise<Permission> {
    // Override libraryId with the path param
    createPermissionDto.libraryId = id;
    return this.libraryService.createPermission(createPermissionDto, user);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get all permissions for a library' })
  @ApiResponse({ status: 200, description: 'List of permissions', type: [Permission] })
  async getPermissions(@Param('id') id: string, @UserDecorator() user: User): Promise<Permission[]> {
    return this.libraryService.getPermissionsByLibrary(id, user);
  }

  @Delete('permissions/:id')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  async deletePermission(@Param('id') id: string, @UserDecorator() user: User): Promise<void> {
    return this.libraryService.deletePermission(id, user);
  }

  @Put(':id/permissions/:userId')
  @ApiOperation({ summary: 'Update permission for a specific user' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully', type: Permission })
  async updatePermission(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @UserDecorator() user: User,
  ): Promise<Permission> {
    return this.libraryService.updatePermission(id, userId, updatePermissionDto, user);
  }
}

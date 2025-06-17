import { Attachment } from 'src/attachment/attachment.model';
import { QueryValidationPipe } from 'src/common/pipes/query-validation.pipe';
import { LibraryListResponseDto } from 'src/library/dto/list-library.dto';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../user/user.model';
import { CreateLibraryDto } from './dto/create-library.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import {
  GetLibraryUsersDto,
  LibraryUsersResponseDto,
} from './dto/get-library-users.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { LibraryService } from './library.service';
import { Library } from './models/library.model';
import { Permission } from './models/permission.model';

@ApiTags('Library')
@Controller('library')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LibraryController {
  private readonly attachmentQueryPipe: QueryValidationPipe;
  private readonly libraryQueryPipe: QueryValidationPipe;
  constructor(private readonly libraryService: LibraryService) {
    this.attachmentQueryPipe = new QueryValidationPipe(
      ['fileType'], // allowedAttributes
      [], // allowedOperators (giới hạn chỉ cho phép một số toán tử)
      ['fileType'], // eqOnlyFields (status chỉ được dùng với toán tử eq)
    );
    this.libraryQueryPipe = new QueryValidationPipe(
      ['title'], // allowedAttributes
      [], // allowedOperators (giới hạn chỉ cho phép một số toán tử)
      ['title'], // eqOnlyFields (status chỉ được dùng với toán tử eq)
    );
  }

  // Library endpoints
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.BOD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new library (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Library created successfully',
    type: Library,
  })
  async createLibrary(
    @Body() createLibraryDto: CreateLibraryDto,
    @UserDecorator() user: User,
  ): Promise<Library> {
    return this.libraryService.createLibrary(createLibraryDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accessible libraries' })
  @ApiResponse({
    status: 200,
    description: 'List of accessible libraries',
    type: [Library],
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description:
      'Filter query in JSON format or query string format. Examples: {"username_like":"john"} or username_like=john&email=test@example.com',
    type: String,
  })
  async findAllLibraries(
    @UserDecorator() user: User,
    @Query() query: any,
  ): Promise<LibraryListResponseDto> {
    const validatedQuery = await this.libraryQueryPipe.transform(query);
    return await this.libraryService.findAllLibraries(user, validatedQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a library by id' })
  @ApiResponse({ status: 200, description: 'Library details', type: Library })
  async findLibrary(
    @Param('id') id: string,
    @UserDecorator() user: User,
  ): Promise<Library> {
    return this.libraryService.findLibraryById(id, user);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BOD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a library' })
  @ApiResponse({
    status: 200,
    description: 'Library updated successfully',
    type: Library,
  })
  async updateLibrary(
    @Param('id') id: string,
    @Body() updateLibraryDto: UpdateLibraryDto,
    @UserDecorator() user: User,
  ): Promise<Library> {
    return this.libraryService.updateLibrary(id, updateLibraryDto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BOD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a library' })
  @ApiResponse({ status: 200, description: 'Library deleted successfully' })
  async deleteLibrary(
    @Param('id') id: string,
    @UserDecorator() user: User,
  ): Promise<Library> {
    return this.libraryService.deleteLibrary(id, user);
  }

  // Attachment endpoints
  @Post(':id/attachments')
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an attachment to a library' })
  @ApiResponse({
    status: 201,
    description: 'Attachment uploaded successfully',
    type: Attachment,
    isArray: true,
  })
  async uploadAttachment(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @UserDecorator() user: User,
  ): Promise<Attachment[]> {
    return this.libraryService.uploadAttachment({ files, libraryId: id, user });
  }

  @Get(':id/attachments')
  @ApiOperation({ summary: 'Get all attachments in a library' })
  @ApiResponse({
    status: 200,
    description: 'List of attachments',
    type: [Attachment],
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description:
      'Filter query in JSON format or query string format. Examples: {"username_like":"john"} or username_like=john&email=test@example.com',
    type: String,
  })
  async getAttachments(
    @Param('id') id: string,
    @Query() query: any,
    @UserDecorator() user: User,
  ): Promise<{ attachments: Attachment[]; library: Library }> {
    const validatedQuery = await this.attachmentQueryPipe.transform(query);
    return this.libraryService.getAttachmentsByLibrary(
      id,
      validatedQuery,
      user,
    );
  }

  @Delete('attachments/:id')
  @ApiOperation({ summary: 'Delete an attachment' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  async deleteAttachment(
    @Param('id') id: string,
    @UserDecorator() user: User,
  ): Promise<Attachment | null> {
    return await this.libraryService.deleteAttachment(id, user);
  }

  // Permission endpoints
  @Post(':id/permissions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BOD)
  @ApiOperation({ summary: 'Grant permission to a user for a library' })
  @ApiResponse({
    status: 201,
    description: 'Permission granted successfully',
    type: Permission,
  })
  async createPermission(
    @Param('id') id: string,
    @Body() createPermissionDto: CreatePermissionDto,
    @UserDecorator() user: User,
  ): Promise<Permission> {
    // Override libraryId with the path param
    return this.libraryService.createPermission(createPermissionDto, id, user);
  }

  @Get(':id/permissions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BOD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all permissions for a library' })
  @ApiResponse({
    status: 200,
    description: 'List of permissions',
    type: [Permission],
  })
  async getPermissions(
    @Param('id') id: string,
    @UserDecorator() user: User,
  ): Promise<Permission[]> {
    return this.libraryService.getPermissionsByLibrary(id, user);
  }

  @Delete('permissions/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BOD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  async deletePermission(
    @Param('id') id: string,
    @UserDecorator() user: User,
  ): Promise<Permission | null> {
    return await this.libraryService.deletePermission(id, user);
  }

  // Library Users Management endpoints
  @Get(':id/users')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BOD, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all users with their access status for a library',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users with access status',
    type: LibraryUsersResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or email',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['granted', 'not_granted'],
    description: 'Filter by access status',
  })
  async getLibraryUsers(
    @Param('id') id: string,
    @Query() query: GetLibraryUsersDto,
    @UserDecorator() user: User,
  ): Promise<LibraryUsersResponseDto> {
    return this.libraryService.getLibraryUsers(id, query, user);
  }

  @Post(':id/users/:userId/grant-access')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BOD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Grant access to a user for a library' })
  @ApiResponse({
    status: 201,
    description: 'Access granted successfully',
    type: Permission,
  })
  async grantLibraryAccess(
    @Param('id') libraryId: string,
    @Param('userId') userId: string,
    @UserDecorator() user: User,
  ): Promise<Permission> {
    return this.libraryService.grantLibraryAccess(libraryId, userId, user);
  }

  @Delete(':id/users/:userId/revoke-access')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BOD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke access from a user for a library' })
  @ApiResponse({ status: 200, description: 'Access revoked successfully' })
  async revokeLibraryAccess(
    @Param('id') libraryId: string,
    @Param('userId') userId: string,
    @UserDecorator() user: User,
  ): Promise<{ message: string; permission: Permission }> {
    return this.libraryService.revokeLibraryAccess(libraryId, userId, user);
  }
}

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
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
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
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Permission } from './models/permission.model';
import { QueryValidationPipe } from 'src/common/pipes/query-validation.pipe';
import { Attachment } from 'src/attachment/attachment.model';

@ApiTags('Library')
@Controller('library')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LibraryController {
  private readonly acttachmentQueryPipe: QueryValidationPipe;
  constructor(private readonly libraryService: LibraryService) {
    this.acttachmentQueryPipe = new QueryValidationPipe(
      [], // allowedAttributes
      [], // allowedOperators (giới hạn chỉ cho phép một số toán tử)
      [], // eqOnlyFields (status chỉ được dùng với toán tử eq)
    );
  }

  // Library endpoints
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
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
  async findAllLibraries(@UserDecorator() user: User): Promise<Library[]> {
    return this.libraryService.findAllLibraries(user);
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
  @Roles(UserRole.MENTOR)
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
  @Roles(UserRole.MENTOR)
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
  ): Promise<Attachment[]> {
    const validatedQuery = await this.acttachmentQueryPipe.transform(
      query.filter,
    );
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
  @Roles(UserRole.MENTOR)
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
  @Roles(UserRole.MENTOR)
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
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  async deletePermission(
    @Param('id') id: string,
    @UserDecorator() user: User,
  ): Promise<Permission | null> {
    return await this.libraryService.deletePermission(id, user);
  }
}

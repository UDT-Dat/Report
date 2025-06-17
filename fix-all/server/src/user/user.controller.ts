import { MulterExceptionFilter } from 'src/common/filters/multer-exception.filter';
import { QueryValidationPipe } from 'src/common/pipes/query-validation.pipe';
import { UserListResponseDto } from 'src/user/dto/list-response.dto';

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
  Request,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UpdateUserByIdDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from './dto/update-user.dto';
import { User, UserRole, UserStatus } from './user.model';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  private readonly userQueryPipe: QueryValidationPipe;
  constructor(private readonly userService: UserService) {
    this.userQueryPipe = new QueryValidationPipe(
      ['name', 'role', 'status', 'text'], // allowedAttributes
      [], // allowedOperators (giới hạn chỉ cho phép một số toán tử)
      ['text', 'name', 'role', 'status'], // eqOnlyFields (status chỉ được dùng với toán tử eq)
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req,
  ): Promise<User> {
    return this.userService.create(createUserDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BOD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    name: 'query',
    required: false,
    description:
      'Filter query in JSON format or query string format. Examples: {"username_like":"john"} or username_like=john&email=test@example.com',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserListResponseDto],
  })
  async findAll(
    @Query() query: Record<string, unknown>,
  ): Promise<UserListResponseDto> {
    const validatedQuery = this.userQueryPipe.transform(query);
    return this.userService.findAll(validatedQuery);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile', type: User })
  async getProfile(@Request() req): Promise<User> {
    return await this.userService.findById(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'User details', type: User })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }
  @Put('/update/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({
    status: 200,
    description: 'User password updated successfully',
  })
  async updatePassword(
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    @Request() req,
  ): Promise<{ message: string; status: 'success' | 'error' }> {
    return this.userService.updatePassword(
      req.user.userId as string,
      updateUserPasswordDto,
    );
  }
  @Put('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, cb) => {
        // Kiểm tra loại file có phải là hình ảnh không
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException(
              'Only image files are allowed (jpg, jpeg, png, gif)',
            ),
            false,
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
        type: {
          type: 'string',
          enum: ['avatar', 'cover'],
        },
      },
    },
  })
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiResponse({ status: 200, description: 'User avatar updated successfully' })
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: 'avatar' | 'coverImage',
    @Request() req,
  ): Promise<User> {
    if (!file) {
      throw new BadRequestException(
        `Image file is required for ${type} update`,
      );
    }

    return await this.userService.updateAvatar(
      req.user.userId as string,
      file,
      type,
    );
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ): Promise<User> {
    return this.userService.update(req.user.userId as string, updateUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  async updateById(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserByIdDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async remove(@Param('id') id: string): Promise<User> {
    return this.userService.remove(id);
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BOD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a pending user' })
  @ApiResponse({
    status: 200,
    description: 'User approved successfully',
    type: User,
  })
  async approveUser(@Param('id') id: string): Promise<User> {
    return this.userService.approveUser(id);
  }

  @Put(':id/assign-mentor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign mentor role to a member' })
  @ApiResponse({
    status: 200,
    description: 'Mentor role assigned successfully',
    type: User,
  })
  async assignMentor(@Param('id') id: string): Promise<User> {
    return this.userService.assignMentor(id);
  }

  @Put(':id/update-verification-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.BOD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user verification status' })
  @ApiResponse({
    status: 200,
    description: 'User verification status updated successfully',
    type: User,
  })
  async updateVerificationStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
    @Body('rejectReason') reason?: string,
  ): Promise<User> {
    if (![UserStatus.ACTIVE, UserStatus.REJECTED].includes(status)) {
      throw new BadRequestException('Mã trạng thái không hợp lệ');
    }
    return this.userService.updateVerifyStatus(id, status, reason);
  }

  @Get('export/data')
  async exportData(
    @Query()
    query: {
      search?: string;
      role?: string;
      status?: string;
    },
    @Res() res: ExpressResponse,
  ) {
    const buffer = await this.userService.generateExcel({
      search: query.search,
      role: query.role,
      status: query.status,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="danh-sach-nguoi-dung-${new Date().toISOString().split('T')[0]}.xlsx"`,
    );

    res.end(buffer);
  }
}

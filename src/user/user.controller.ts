import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './user.model';
import { QueryValidationPipe } from 'src/common/pipes/query-validation.pipe';
@ApiTags('Users')
@Controller('users')
export class UserController {
    private readonly userQueryPipe: QueryValidationPipe;
    constructor(private readonly userService: UserService) {
        this.userQueryPipe = new QueryValidationPipe(
            [], // allowedAttributes
            [], // allowedOperators (giới hạn chỉ cho phép một số toán tử)
            [] // eqOnlyFields (status chỉ được dùng với toán tử eq)
        );
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully', type: User })
    async create(@Body() createUserDto: CreateUserDto, @Request() req): Promise<User> {
        return this.userService.create(createUserDto, req.user);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users' })
    @ApiQuery({
        name: 'filter',
        required: false,
        description: 'Filter query in JSON format or query string format. Examples: {"username_like":"john"} or username_like=john&email=test@example.com',
        type: String
    })
    @ApiResponse({ status: 200, description: 'List of all users', type: [User] })
    async findAll(@Query() query: any): Promise<User[]> {
        const validatedQuery = await this.userQueryPipe.transform(query.filter);
        return this.userService.findAll(validatedQuery);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a user by id' })
    @ApiResponse({ status: 200, description: 'User details', type: User })
    async findOne(@Param('id') id: string): Promise<User> {
        return this.userService.findById(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a user' })
    @ApiResponse({ status: 200, description: 'User updated successfully', type: User })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
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
    @Roles(UserRole.ADMIN, UserRole.MENTOR)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Approve a pending user' })
    @ApiResponse({ status: 200, description: 'User approved successfully', type: User })
    async approveUser(@Param('id') id: string): Promise<User> {
        return this.userService.approveUser(id);
    }

    @Put(':id/assign-mentor')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Assign mentor role to a member' })
    @ApiResponse({ status: 200, description: 'Mentor role assigned successfully', type: User })
    async assignMentor(@Param('id') id: string): Promise<User> {
        return this.userService.assignMentor(id);
    }
} 
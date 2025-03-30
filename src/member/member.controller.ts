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
import { Member } from './member.model';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';

@ApiTags('Members')
@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  @ApiOperation({ summary: 'Get all members with pagination' })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of members retrieved successfully',
    type: Member,
    isArray: true,
  })
  findAll(@Query('size') size: number, @Query('page') page: number) {
    return this.memberService.findAll(size, page);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific member by ID' })
  @ApiResponse({
    status: 200,
    description: 'Member found successfully',
    type: Member,
  })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new member' })
  @ApiResponse({
    status: 201,
    description: 'Member created successfully',
    type: Member,
  })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing member' })
  @ApiResponse({
    status: 200,
    description: 'Member updated successfully',
    type: Member,
  })
  @ApiResponse({ status: 404, description: 'Member not found' })
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(id, updateMemberDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a member' })
  @ApiResponse({ status: 200, description: 'Member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  delete(@Param('id') id: string) {
    return this.memberService.delete(id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Comment } from './comment.model';
import { CommentService } from './comment.service';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: Comment,
  })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ): Promise<Comment> {
    return this.commentService.create(createCommentDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get comments for a post with pagination' })
  @ApiResponse({ status: 200, description: 'List of comments' })
  async findByPostId(@Query() commentQueryDto: CommentQueryDto): Promise<{
    comments: Comment[];
    pagination: { total: number; page: number; limit: number };
  }> {
    return await this.commentService.findByPostId(commentQueryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  async remove(@Param('id') id: string, @Request() req): Promise<Comment> {
    return this.commentService.removeById(id, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ): Promise<Comment> {
    return this.commentService.update(id, updateCommentDto, req.user);
  }
}

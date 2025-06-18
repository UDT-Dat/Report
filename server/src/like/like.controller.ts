import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
import { CreateLikeDto } from './dto/create-like.dto';
import { Like } from './like.model';
import { LikeService } from './like.service';

@ApiTags('Likes')
@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a post' })
  @ApiResponse({
    status: 201,
    description: 'Post liked successfully',
    type: Like,
  })
  async likePost(
    @Body() createLikeDto: CreateLikeDto,
    @Request() req,
  ): Promise<Like> {
    return this.likeService.likePost(createLikeDto, req.user);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiResponse({ status: 200, description: 'Post unliked successfully' })
  async unlikePost(
    @Body() createLikeDto: CreateLikeDto,
    @Request() req,
  ): Promise<{ message: string }> {
    await this.likeService.unlikePost(createLikeDto.postId, req.user);
    return { message: 'Post unliked successfully' };
  }

  @Get(':postId/check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if the current user has liked a post' })
  @ApiResponse({ status: 200, description: 'Like status', type: Boolean })
  async checkIfLiked(
    @Param('postId') postId: string,
    @Request() req,
  ): Promise<{ isLiked: boolean }> {
    const isLiked = await this.likeService.checkIfLiked(postId, req.user);
    return { isLiked };
  }

  @Get(':postId/count')
  @ApiOperation({ summary: 'Count the number of likes for a post' })
  @ApiResponse({ status: 200, description: 'Like count', type: Number })
  async countLikes(
    @Param('postId') postId: string,
  ): Promise<{ count: number }> {
    const count = await this.likeService.countLikes(postId);
    return { count };
  }

  @Get(':postId/getLikes')
  @ApiOperation({ summary: 'Get all likes for a post' })
  @ApiResponse({
    status: 200,
    description: 'List of likes for the post',
    type: [Like],
  })
  async getLikesForPost(
    @Param('postId') postId: string,
    @Query()
    query: {
      limit?: number;
      page?: number;
    },
  ): Promise<{
    likes: Like[];
    pagination: { total: number; page: number; limit: number };
  }> {
    return this.likeService.getLikesByPostId(postId, query);
  }
}

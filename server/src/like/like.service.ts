import { Model } from 'mongoose';

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateLikeDto } from './dto/create-like.dto';
import { Like, LikeDocument } from './like.model';

@Injectable()
export class LikeService {
  constructor(@InjectModel(Like.name) private likeModel: Model<LikeDocument>) {}

  async likePost(
    createLikeDto: CreateLikeDto,
    currentUser: any,
  ): Promise<Like> {
    try {
      const newLike = await this.likeModel.create({
        post: createLikeDto.postId,
        user: currentUser.userId,
      });

      return newLike;
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error code
        throw new ConflictException('You have already liked this post');
      }
      throw error;
    }
  }

  async unlikePost(postId: string, currentUser: any): Promise<void> {
    const result = await this.likeModel.deleteOne({
      post: postId,
      user: currentUser.userId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('You have not liked this post');
    }
  }

  async checkIfLiked(postId: string, currentUser: any): Promise<boolean> {
    const like = await this.likeModel.findOne({
      post: postId,
      user: currentUser.userId,
    });

    return !!like;
  }

  async countLikes(postId: string): Promise<number> {
    return this.likeModel.countDocuments({ post: postId });
  }

  async getLikesByPostId(
    postId: string,
    query: {
      page?: number;
      limit?: number;
    },
  ): Promise<{
    likes: Like[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const { page = 1, limit = 10 } = query;
    const likes = await this.likeModel
      .find({ post: postId })
      .populate('user', 'name email avatar role')
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await this.likeModel.countDocuments({ post: postId });
    return { likes, pagination: { page, limit, total } };
  }
}

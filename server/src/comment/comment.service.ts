import { Model } from 'mongoose';
import { toObjectId } from 'src/common/utils';

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Comment, CommentDocument } from './comment.model';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    currentUser: any,
  ): Promise<Comment> {
    const newComment = await this.commentModel.create({
      content: createCommentDto.content,
      post: toObjectId(createCommentDto.postId),
      createdBy: currentUser.userId,
    });

    return newComment.populate('createdBy', 'name email avatar _id');
  }

  async findByPostId(commentQueryDto: CommentQueryDto): Promise<{
    comments: Comment[];
    pagination: { total: number; page: number; limit: number };
  }> {
    const { postId, page = 1, limit = 10 } = commentQueryDto;

    const skip = (page - 1) * limit;

    const [result] = await this.commentModel.aggregate([
      {
        $match: { post: toObjectId(postId) },
      },
      {
        $facet: {
          metadata: [
            {
              $count: 'total',
            },
            {
              $addFields: {
                page,
                limit,
              },
            },
          ],
          data: [
            {
              $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy',
              },
            },
            {
              $unwind: '$createdBy',
            },
            {
              $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                createdBy: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  avatar: 1,
                },
                updatedAt: 1,
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
        },
      },
    ]);
    return {
      comments: result.data,
      pagination: result.metadata[0],
    };
  }

  async removeById(commentId: string, currentUser: any): Promise<Comment> {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if the current user is the comment owner
    if (comment.createdBy.toString() !== currentUser.userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await comment.deleteOne();
    return comment;
  }
  async update(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    currentUser: any,
  ): Promise<Comment> {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.createdBy.toString() !== currentUser.userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    comment.content = updateCommentDto.content;
    await comment.save();
    return comment;
  }
}

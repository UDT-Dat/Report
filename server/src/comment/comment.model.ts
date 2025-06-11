import { Document, Schema as MongooseSchema } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { Post } from '../post/post.model';
import { User } from '../user/user.model';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: string;

  @ApiProperty({ description: 'The content of the comment' })
  @Prop({ required: true })
  content: string;

  @ApiProperty({ description: 'The post this comment belongs to' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  post: Post;

  @ApiProperty({ description: 'The user who created the comment' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @ApiProperty({ description: 'The timestamp when the comment was created' })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the comment was last updated',
  })
  updatedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

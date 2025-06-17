import { Document, Schema as MongooseSchema } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { Post } from '../post/post.model';
import { User } from '../user/user.model';

export type LikeDocument = Like & Document;

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: string;

  @ApiProperty({ description: 'The post this like belongs to' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  post: Post;

  @ApiProperty({ description: 'The user who liked the post' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @ApiProperty({ description: 'The timestamp when the like was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The timestamp when the like was last updated' })
  updatedAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

// Create a compound unique index to ensure a user can like a post only once
LikeSchema.index({ post: 1, user: 1 }, { unique: true });

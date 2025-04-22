import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../auth/user.model';

export type PostDocument = Post & Document;

export enum PostStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: MongooseSchema.Types.ObjectId;

  @Prop({ default: PostStatus.PENDING })
  status: PostStatus;

  @Prop([String])
  attachments: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.model';

export type PostDocument = Post & Document;
export enum PostStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: string;

  @ApiProperty({ description: 'The title of the post' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'The content of the post' })
  @Prop({ required: true })
  content: string;

  @ApiProperty({ description: 'The admin who created the post' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @ApiProperty({ description: 'Banner image URL for the post' })
  @Prop()
  bannerImage: string;

  attachments?: any[];
  @ApiProperty({ description: 'The timestamp when the post was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The timestamp when the post was last updated' })
  updatedAt: Date;

  @ApiProperty({ description: 'The status of the post' })
  @Prop({ enum: PostStatus, default: PostStatus.Pending })
  status: PostStatus = PostStatus.Pending;

  @ApiProperty({ description: 'The priority of the post', required: false })
  @Prop({ type: Number, default: () => null })
  priority?: number;

  @ApiProperty({
    description: 'The reason for rejection, if any',
    required: false,
  })
  @Prop()
  rejectReason?: string;
}

const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.virtual('attachments', {
  ref: 'Attachment',
  localField: '_id',
  foreignField: 'ownerId',
  justOne: false,
  options: { match: { ownerType: 'Post' } },
});
PostSchema.set('toObject', { virtuals: true });
PostSchema.set('toJSON', { virtuals: true });
export { PostSchema };

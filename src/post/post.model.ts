import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.model';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @ApiProperty({ description: 'The unique identifier of the post' })
  @Prop()
  id: string;

  @ApiProperty({ description: 'The title of the post' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'The content of the post' })
  @Prop({ required: true })
  content: string;

  @ApiProperty({ description: 'The admin who created the post' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @ApiProperty({ description: 'Featured image URL for the post' })
  @Prop()
  imageUrl: string;

  @ApiProperty({ description: 'The timestamp when the post was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The timestamp when the post was last updated' })
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post); 
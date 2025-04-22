import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.model';

export type LibraryDocument = Library & Document;

@Schema({ timestamps: true })
export class Library {
  @ApiProperty({ description: 'The unique identifier of the resource' })
  @Prop()
  id: string;

  @ApiProperty({ description: 'The title of the resource' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'The description of the resource' })
  @Prop()
  description: string;

  @ApiProperty({ description: 'The file URL or path of the resource' })
  @Prop({ required: true })
  fileUrl: string;

  @ApiProperty({ description: 'The type of the resource (pdf, doc, video, etc)' })
  @Prop()
  fileType: string;

  @ApiProperty({ description: 'The size of the file in bytes' })
  @Prop()
  fileSize: number;

  @ApiProperty({ description: 'The user who uploaded the resource' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  uploadedBy: User;

  @ApiProperty({ description: 'Users who have permission to access this resource' })
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  accessibleBy: User[];

  @ApiProperty({ description: 'The timestamp when the resource was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The timestamp when the resource was last updated' })
  updatedAt: Date;
}

export const LibrarySchema = SchemaFactory.createForClass(Library); 
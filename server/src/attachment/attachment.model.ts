import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.model';

export type AttachmentDocument = Attachment & Document;

@Schema({ timestamps: true })
export class Attachment {
  @ApiProperty({ description: 'The original filename' })
  @Prop({ required: true })
  originalname: string;

  @ApiProperty({ description: 'The local URL/path to the file' })
  @Prop({ required: true })
  url: string;

  @ApiProperty({ description: 'The file type/mimetype' })
  @Prop({ required: true })
  fileType: string;

  @ApiProperty({ description: 'The file size in bytes' })
  @Prop({ required: true })
  size: number;

  @ApiProperty({ description: 'Owner type: Post or Library' })
  @Prop({ required: true, enum: ['Post', 'Library'] })
  ownerType: 'Post' | 'Library';

  @ApiProperty({ description: 'The object ID of the owner (post or library)' })
  @Prop({ type: Types.ObjectId, required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ description: 'The user who uploaded the file' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: User;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

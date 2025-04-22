import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/user.model';

export type MediaDocument = Media & Document;

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

@Schema({ timestamps: true })
export class Media {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalname: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true, enum: MediaType })
  type: MediaType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: User;

  @Prop()
  description: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

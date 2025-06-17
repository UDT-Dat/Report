import { Document, Schema as MongooseSchema } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '../../user/user.model';

export type LibraryDocument = Library & Document;

@Schema({ timestamps: true })
export class Library {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: string;

  @ApiProperty({ description: 'The title of the library' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'The description of the library' })
  @Prop()
  description: string;

  @ApiProperty({ description: 'The admin who created the library' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @ApiProperty({ description: 'The admin who created the library' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  lastUpdateBy: User;

  @ApiProperty({ description: 'The timestamp when the library was created' })
  createdAt: Date;
  @ApiProperty({
    description: 'The timestamp when the library was last updated',
  })
  updatedAt: Date;

  attachments?: any[];
}

const LibrarySchema = SchemaFactory.createForClass(Library);
LibrarySchema.virtual('attachments', {
  ref: 'Attachment',
  localField: '_id',
  foreignField: 'ownerId',
  justOne: false,
  options: { match: { ownerType: 'Library' } },
});
LibrarySchema.set('toObject', { virtuals: true });
LibrarySchema.set('toJSON', { virtuals: true });
export { LibrarySchema };

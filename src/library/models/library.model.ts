import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/user.model';

export type LibraryDocument = Library & Document;

@Schema({ timestamps: true })
export class Library {
  @ApiProperty({ description: 'The unique identifier of the library' })
  @Prop()
  id: string;

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

  @ApiProperty({ description: 'The timestamp when the library was last updated' })
  updatedAt: Date;
}

export const LibrarySchema = SchemaFactory.createForClass(Library); 
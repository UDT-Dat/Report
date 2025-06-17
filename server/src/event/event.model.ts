import { Document, Schema as MongooseSchema } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { User } from '../user/user.model';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: string;
  @ApiProperty({ description: 'The title of the event' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'The description of the event' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'The location of the event' })
  @Prop({ required: true })
  location: string;

  @ApiProperty({ description: 'The start date and time of the event' })
  @Prop({ required: true })
  startDate: Date;

  @ApiProperty({ description: 'The end date and time of the event' })
  @Prop({ required: true })
  endDate: Date;

  @ApiProperty({ description: 'The maximum number of participants' })
  @Prop()
  maxParticipants: number;

  @ApiProperty({ description: 'The admin who created the event' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @ApiProperty({ description: 'The list of participants' })
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  participants: User[];

  @ApiProperty({ description: 'Image URL for the event' })
  @Prop({ required: true })
  imageUrl: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);

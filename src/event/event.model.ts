import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Schema()
export class Event {
  @ApiProperty({ description: 'The title of the event' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'The detailed description of the event' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'Start date and time of the event' })
  @Prop({ required: true })
  startDate: Date;

  @ApiProperty({ description: 'End date and time of the event' })
  @Prop({ required: true })
  endDate: Date;

  @ApiProperty({ description: 'The location where the event takes place' })
  @Prop({ required: true })
  location: string;

  @ApiProperty({ description: 'The URL of the event image' })
  @Prop()
  image?: string;

  @ApiProperty({ description: 'Maximum number of participants allowed' })
  @Prop({ type: Number, min: 0 })
  maxParticipants?: number;

  @ApiProperty({ description: 'The status of the event' })
  @Prop({ type: String, enum: EventStatus, default: EventStatus.DRAFT })
  status: EventStatus;

  @ApiProperty({ description: 'The timestamp when the event was created' })
  @Prop({ default: Date.now })
  createdAt: Date;

  @ApiProperty({ description: 'The timestamp when the event was last updated' })
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

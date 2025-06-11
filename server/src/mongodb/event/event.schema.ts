import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'events' })
export class EventISchema {
  @Prop({ _id: true })
  id: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  date: Date;

  @Prop()
  location: string;

  @Prop()
  image: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<EventISchema>;

export const EventSchema = SchemaFactory.createForClass(EventISchema);

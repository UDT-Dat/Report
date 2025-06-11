import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EventDocument, EventISchema } from './event.schema';

@Injectable()
export class EventRepository {
  constructor(
    @InjectModel(EventISchema.name)
    private eventModel: Model<EventDocument>,
  ) {}

  async findAll(): Promise<EventDocument[]> {
    return this.eventModel.find().exec();
  }
}

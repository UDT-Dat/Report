import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EventRepository } from './event/event.repository';
import { EventISchema, EventSchema } from './event/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventISchema.name, schema: EventSchema },
    ]),
  ],
  providers: [EventRepository],
  exports: [EventRepository],
})
export class MongoDBModule {}

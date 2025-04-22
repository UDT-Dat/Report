import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event, EventSchema } from './event.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService]
})
export class EventModule { }

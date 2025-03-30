import { Injectable } from '@nestjs/common';
import { EventRepository } from 'src/mongodb/event/event.repository';
import { Event } from './event.model';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  findAll(size?: number, page?: number) {
    return this.eventRepository.findAll();
  }

  findOne(id: string) {
    return {
      id,
    };
  }

  create(event: Event) {
    return {
      event,
    };
  }

  update(id: string, event: Event) {
    return {
      id,
      event,
    };
  }

  delete(id: string) {
    return {
      id,
    };
  }
}

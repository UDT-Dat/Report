import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Event, EventDocument } from './event.model';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User, UserRole } from '../user/user.model';
import { toObjectId } from 'src/common/utils';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) { }

  async create(createEventDto: CreateEventDto, imageUrl: string, user: any): Promise<Event> {
    console.log("events user:", user)
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can create events');
    }

    const event = new this.eventModel({
      ...createEventDto,
      imageUrl,
      createdBy: toObjectId(user.userId),
      participants: [],
    });

    return event.save();
  }


  async findAll({ size = 10, page = 1 }: { size?: number; page?: number }): Promise<Event[]> {
    return this.eventModel.find()
      .limit(size)
      .skip((page - 1) * size)
      .populate('createdBy')
      .populate('participants')
      .exec();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id)
      .populate({
        path: 'createdBy',
        select: 'name email _id phone address'
      })
      .populate({
        path: 'participants',
        select: '-__v'
      })
      .exec();

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, file: Express.Multer.File | undefined, user: any): Promise<Event> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update events');
    }
    let imageUrl: string | null = null;
    if (file) {
      imageUrl = file.path;
    }

    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }



    const updated = await this.eventModel.findByIdAndUpdate(id, { ...updateEventDto, ...(imageUrl ? { imageUrl } : {}) }, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException(`Event with id ${id} not found after update`);
    }
    return updated;
  }

  async remove(id: string, user: User): Promise<Event> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete events');
    }

    const event = await this.eventModel.findByIdAndDelete(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    return event;
  }

  async joinEvent(id: string, user: any): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    const isParticipant = event.participants.some(p => p.toString() === user['_id'].toString());
    if (isParticipant) {
      throw new ConflictException('You have already joined this event');
    }

    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      throw new ConflictException('This event has reached maximum participants');
    }

    event.participants.push(toObjectId(user.userId));
    return event.save();
  }

  async leaveEvent(id: string, user: any): Promise<Event> {
    console.log("user", user)
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    const isParticipant = event.participants.some(p => p.toString() === user.userId);
    if (!isParticipant) {
      throw new ConflictException('You are not a participant of this event');
    }

    event.participants = event.participants.filter(p => p.toString() !== user.userId);
    return event.save();
  }
}

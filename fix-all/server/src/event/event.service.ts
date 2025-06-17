import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as ExcelJS from 'exceljs';
import { Model, Types } from 'mongoose';
import { toObjectId } from 'src/common/utils';
import convertParam from 'src/common/utils/convert-params';
import { NotificationService } from 'src/notification/notification.service';
import { UploadService } from 'src/upload/upload.service';
import { UserService } from 'src/user/user.service';
import { User, UserRole } from '../user/user.model';
import { CreateEventDto } from './dto/create-event.dto';
import { EventListResponseDto } from './dto/list-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventDocument } from './event.model';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    file: Express.Multer.File,
    user: any,
  ): Promise<Event> {
    if (user.role !== UserRole.BOD) {
      throw new ForbiddenException('Chỉ mentor mới có thể tạo sự kiện');
    }

    const imageUpload = await this.uploadService.uploadToCloudinary(file);

    const event = new this.eventModel({
      ...createEventDto,
      imageUrl: imageUpload.url || imageUpload.secure_url,
      createdBy: toObjectId(user.userId as string),
      participants: [],
    });

    return event.save();
  }

  async findAll(query: object): Promise<EventListResponseDto> {
    const { result: filter, errors, pagination } = convertParam(query);
    if (errors.length > 0) {
      throw new BadRequestException(errors.join('.'));
    }
    // filter { startDate: { '$gte': 1748240135477 } }
    if ('startDate' in filter) {
      filter.startDate = Object.entries(filter.startDate as object).map(
        ([key, value]) => {
          return {
            [key]: new Date(value as string | number | Date),
          };
        },
      )[0];
    }
    if ('endDate' in filter) {
      filter.endDate = Object.entries(filter.endDate as object).map(
        ([key, value]) => {
          return {
            [key]: new Date(value as string | number | Date),
          };
        },
      )[0];
    }
    const [result] = await this.eventModel.aggregate([
      { $match: filter },
      {
        $facet: {
          metadata: [
            {
              $count: 'total',
            },
            {
              $addFields: {
                page: pagination.page,
                limit: pagination.limit,
              },
            },
          ],
          data: [
            {
              $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy',
              },
            },
            {
              $unwind: '$createdBy',
            },
            {
              $project: {
                _id: 1,
                title: 1,
                description: 1,
                imageUrl: 1,
                createdBy: 1,
                participants: 1,
                createdAt: 1,
                updatedAt: 1,
                startDate: 1,
                endDate: 1,
                location: 1,
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $skip: (pagination.page - 1) * pagination.limit,
            },
            {
              $limit: pagination.limit,
            },
          ],
        },
      },
    ]);
    return {
      pagination: result.metadata[0] ?? {
        total: 0,
        page: pagination.page,
        limit: pagination.limit,
      },
      events: result.data,
    };
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel
      .findById(id)
      .populate({
        path: 'createdBy',
        select: 'name email _id phone address avatar',
      })
      .lean();

    if (!event) {
      throw new NotFoundException(`Không tìm thấy sự kiện với id ${id}`);
    }

    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    file: Express.Multer.File | undefined,
    user: any,
  ): Promise<Event> {
    if (user.role !== UserRole.BOD) {
      throw new ForbiddenException('Only mentors can update events');
    }
    let imageUrl: string | null = null;
    if (file) {
      const imageUpload = await this.uploadService.uploadToCloudinary(file);
      imageUrl = imageUpload.url ?? imageUpload.secure_url;
    }

    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    const updated = await this.eventModel
      .findByIdAndUpdate(
        id,
        { ...updateEventDto, ...(imageUrl ? { imageUrl } : {}) },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException(`Event with id ${id} not found after update`);
    }
    return updated;
  }

  async remove(id: string, user: User): Promise<Event> {
    if (user.role !== UserRole.BOD) {
      throw new ForbiddenException('Only mentors can delete events');
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
    const currentDate = new Date();
    if (event.startDate && event.startDate < currentDate) {
      throw new ConflictException('Bạn không thể tham gia sự kiện đã bắt đầu');
    }
    const isParticipant = event.participants.some((p) => {
      const participantId =
        typeof p === 'object' && p !== null && '_id' in p ? p._id : p;
      return participantId.toString() === user['userId']?.toString();
    });
    if (isParticipant) {
      throw new ConflictException('You have already joined this event');
    }
    if (event.participants.length + 1 > event.maxParticipants) {
      throw new ConflictException(
        'This event has reached maximum participants',
      );
    }
    const foundUser = await this.userService.findById(user.userId);
    event.participants.push(toObjectId(foundUser._id));
    await event.save();
    await this.notificationService.createJoinEventNotification(
      event._id,
      event.title,
      foundUser,
    );
    return event;
  }

  async leaveEvent(id: string, user: any): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    const currentDate = new Date();
    if (event.startDate && event.startDate < currentDate) {
      throw new ConflictException('Bạn không thể rời khỏi sự kiện đã bắt đầu');
    }

    const isParticipant = event.participants.some((p) => {
      const participantId =
        typeof p === 'object' && p !== null && '_id' in p ? p._id : p;
      return participantId.toString() === user.userId.toString();
    });
    if (!isParticipant) {
      throw new ConflictException('You are not a participant of this event');
    }

    event.participants = event.participants.filter((p) => {
      const participantId =
        typeof p === 'object' && p !== null && '_id' in p ? p._id : p;
      return participantId.toString() !== user.userId.toString();
    });
    await event.save();
    const foundUser = await this.userService.findById(user.userId);
    await this.notificationService.createLeaveEventNotification(
      event._id,
      event.title,
      foundUser,
    );
    return event;
  }
  async getIsParticipant(id: string, user: any): Promise<boolean> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }
    return event.participants.some((p) => {
      const participantId =
        typeof p === 'object' && p !== null && '_id' in p ? p._id : p;
      return participantId.toString() === user.userId.toString();
    });
  }

  async getEventParticipants(id: string, query: any) {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const search = query.search || '';

    const pipeline = [
      { $match: { _id: toObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'participants',
          foreignField: '_id',
          as: 'participantDetails',
        },
      },
      {
        $project: {
          participantDetails: {
            $filter: {
              input: '$participantDetails',
              cond: search
                ? {
                    $or: [
                      {
                        $regexMatch: {
                          input: '$$this.name',
                          regex: search,
                          options: 'i',
                        },
                      },
                      {
                        $regexMatch: {
                          input: '$$this.email',
                          regex: search,
                          options: 'i',
                        },
                      },
                    ],
                  }
                : true,
            },
          },
        },
      },
      {
        $facet: {
          metadata: [
            { $project: { total: { $size: '$participantDetails' }, _id: 0 } },
            { $addFields: { page, limit } },
          ],
          data: [
            { $unwind: '$participantDetails' },
            { $replaceRoot: { newRoot: '$participantDetails' } },
            {
              $project: {
                name: 1,
                email: 1,
                phone: 1,
                address: 1,
                avatar: 1,
                role: 1,
              },
            },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
        },
      },
    ];

    const [result] = await this.eventModel.aggregate(pipeline as any);

    return {
      participants: result.data,
      pagination: result.metadata[0] || { total: 0, page, limit },
    };
  }

  async exportParticipants(filters: { eventId: string; search?: string }) {
    const eventId = new Types.ObjectId(filters.eventId);

    const event = await this.eventModel.aggregate([
      { $match: { _id: eventId } },
      {
        $lookup: {
          from: 'users',
          let: { participantIds: '$participants' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$participantIds'] },
                ...(filters.search
                  ? {
                      $or: [
                        { name: { $regex: filters.search, $options: 'i' } },
                        { email: { $regex: filters.search, $options: 'i' } },
                        { phone: { $regex: filters.search, $options: 'i' } },
                      ],
                    }
                  : {}),
              },
            },
            {
              $project: {
                name: 1,
                email: 1,
                phone: 1,
                address: 1,
                studentCode: 1,
                course: 1,
                studentCard: 1,
              },
            },
          ],
          as: 'participantsInfo',
        },
      },
      {
        $project: {
          title: 1,
          participantsInfo: 1,
        },
      },
    ]);

    if (!event.length) {
      throw new Error('Không tìm thấy sự kiện');
    }

    const { participantsInfo } = event[0];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participants');

    worksheet.columns = [
      { header: 'Tên', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'phone', width: 20 },
      { header: 'Địa chỉ', key: 'address', width: 40 },
      { header: 'Mã sinh viên', key: 'studentCode', width: 20 },
      { header: 'Khóa học', key: 'course', width: 20 },
      { header: 'Thẻ sinh viên', key: 'studentCard', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    participantsInfo.forEach((user) => {
      worksheet.addRow({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
        studentCode: user.studentCode ?? '',
        course: user.course ?? '',
        studentCard: user.studentCard ?? '',
      });
    });

    return await workbook.xlsx.writeBuffer();
  }

  async getJoinedEvents(
    query: object & { page: string; limit: string },
    userId: string,
  ): Promise<{
    events: Event[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const { result: filter, errors, pagination } = convertParam(query);
    if (errors.length > 0) {
      throw new BadRequestException(errors.join('.'));
    }
    const userObjectId = toObjectId(userId);

    const events = await this.eventModel
      .find({ participants: userObjectId, ...filter })
      .populate({ path: 'participants', select: 'name email' })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .sort({ createdAt: -1 });

    const totalCount = await this.eventModel.countDocuments({
      participants: userObjectId,
      ...filter,
    });

    return {
      events,
      pagination: {
        total: totalCount,
        page: pagination.page,
        limit: pagination.limit,
      },
    };
  }
}

import { Model } from 'mongoose';
import { toObjectId } from 'src/common/utils';

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User } from '../user/user.model';
import { MailService } from './mail.service';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './notification.model';
import { TemplateHelper } from './template.helper';

@Injectable()
export class NotificationService {
  private notificationGateway: any;

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private readonly mailService: MailService,
  ) {}

  // Setter for injecting gateway (to avoid circular dependency)
  setNotificationGateway(gateway: any) {
    this.notificationGateway = gateway;
  }

  async create(
    title: string,
    message: string,
    type: NotificationType,
    user: User,
    relatedId?: string,
    sendEmail: boolean = true,
    sendRealtime: boolean = true,
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      title,
      message,
      type,
      user,
      relatedId,
      isRead: false,
    });

    const savedNotification = await notification.save();

    // Send email notification
    if (sendEmail) {
      this.sendEmailNotification(user.email, title, message);
    }

    // Send realtime notification via WebSocket - chỉ gửi title và message
    if (sendRealtime && this.notificationGateway) {
      await this.notificationGateway.sendNotificationToUser(
        user._id.toString(),
        {
          title: title,
          message: message
        }
      );
    }

    return savedNotification;
  }

  async findAllForUser(userId: string, query: any): Promise<Notification[]> {
    const { isRead, ...rest } = query;
    const filter: any = { user: toObjectId(userId) };

    if (isRead !== undefined) {
      filter.isRead = isRead;
    }

    return this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).lean();

    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).exec();

    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    notification.isRead = true;
    return notification.save();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany({ user: toObjectId(userId), isRead: false }, { isRead: true })
      .exec();
  }

  async remove(id: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findByIdAndDelete(id)
      .lean();

    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    return notification;
  }


  async createJoinEventNotification(
    eventId: string,
    eventTitle: string,
    user: User,
  ): Promise<void> {
    const title = 'Tham gia sự kiện';
    const message = `Bạn đã tham gia sự kiện "${eventTitle}".`;
    await this.create(title, message, NotificationType.JOIN_EVENT, user, eventId);
  }
  async createLeaveEventNotification(
    eventId: string,
    eventTitle: string,
    user: User,
  ): Promise<void> {
    const title = 'Rời khỏi sự kiện';
    const message = `Bạn đã rời khỏi sự kiện "${eventTitle}".`;
    await this.create(title, message, NotificationType.LEAVE_EVENT, user, eventId);
  }
  async createLibraryAccessNotification(
    resourceId: string,
    resourceTitle: string,
    user: any,
  ): Promise<void> {
    const title = 'Library Access Granted';
    const message = `You have been granted access to "${resourceTitle}" in the library.`;
    await this.create(
      title,
      message,
      NotificationType.LIBRARY_ACCESS,
      user,
      resourceId,
    );
  }

  async createAccountApprovedNotification(user: User): Promise<void> {
    const title = 'Account Approved';
    const message =
      'Your account has been approved! You now have full access to the platform.';

    await this.create(title, message, NotificationType.ACCOUNT_APPROVED, user);
  }

  private async sendEmailNotification(
    email: string,
    subject: string,
    content: string,
  ): Promise<void> {
    try {
      // Load the notification template
      const template = await TemplateHelper.loadTemplate('notification');

      // Send the email
      await this.mailService.sendTemplatedEmail(email, subject, template, {
        title: subject,
        message: content,
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
      // We could re-throw the error, but for notifications it might be better to
      // log the error and continue since the notification is already saved in the database
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './notification.model';
import { User } from '../user/user.model';
import { MailService } from './mail.service';
import { TemplateHelper } from './template.helper';
import { toObjectId } from 'src/common/utils';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private readonly mailService: MailService,
  ) {}

  async create(
    title: string,
    message: string,
    type: NotificationType,
    user: User,
    relatedId?: string,
    sendEmail: boolean = true,
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      id: uuidv4(),
      title,
      message,
      type,
      user,
      relatedId,
      isRead: false,
    });

    const savedNotification = await notification.save();

    if (sendEmail) {
      await this.sendEmailNotification(user.email, title, message);
    }

    return savedNotification;
  }

  async findAllForUser(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ user: toObjectId(userId) })
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

  async createEventNotification(
    eventId: string,
    eventTitle: string,
    users: User[],
  ): Promise<void> {
    const title = 'New Event';
    const message = `A new event "${eventTitle}" has been created. Check it out!`;

    for (const user of users) {
      await this.create(
        title,
        message,
        NotificationType.NEW_EVENT,
        user,
        eventId,
      );
    }
  }

  async createPostNotification(
    postId: string,
    postTitle: string,
    users: User[],
  ): Promise<void> {
    const title = 'New Post';
    const message = `A new post "${postTitle}" has been published. Check it out!`;

    for (const user of users) {
      await this.create(
        title,
        message,
        NotificationType.NEW_POST,
        user,
        postId,
      );
    }
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

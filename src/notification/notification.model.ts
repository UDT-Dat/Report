import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.model';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  NEW_EVENT = 'new_event',
  NEW_POST = 'new_post',
  LIBRARY_ACCESS = 'library_access',
  ACCOUNT_APPROVED = 'account_approved',
}

@Schema({ timestamps: true })
export class Notification {
  @ApiProperty({ description: 'The unique identifier of the notification' })
  @Prop()
  id: string;

  @ApiProperty({ description: 'The title of the notification' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'The message of the notification' })
  @Prop({ required: true })
  message: string;

  @ApiProperty({
    enum: NotificationType,
    description: 'The type of notification',
  })
  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @ApiProperty({ description: 'If the notification is read' })
  @Prop({ default: false })
  isRead: boolean;

  @ApiProperty({ description: 'The user who should receive the notification' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: User;

  @ApiProperty({ description: 'Related entity ID (event, post, etc.)' })
  @Prop()
  relatedId: string;

  @ApiProperty({
    description: 'The timestamp when the notification was created',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the notification was last updated',
  })
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

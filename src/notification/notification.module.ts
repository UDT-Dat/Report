import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notification, NotificationSchema } from './notification.model';
import { MailService } from './mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    ConfigModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, MailService],
  exports: [NotificationService],
})
export class NotificationModule {} 
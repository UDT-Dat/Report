import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { MailService } from './mail.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { Notification, NotificationSchema } from './notification.model';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    MailService,
    NotificationGateway,
    {
      provide: 'NOTIFICATION_GATEWAY',
      useFactory: (
        gateway: NotificationGateway,
        service: NotificationService,
      ) => {
        service.setNotificationGateway(gateway);
        return gateway;
      },
      inject: [NotificationGateway, NotificationService],
    },
  ],
  exports: [NotificationService, NotificationGateway, MailService],
})
export class NotificationModule {}

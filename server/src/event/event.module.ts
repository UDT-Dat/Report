import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { NotificationModule } from 'src/notification/notification.module';
import { UploadModule } from 'src/upload/upload.module';
import { UserModule } from 'src/user/user.module';
import { multerConfig } from './config/multer.config';
import { EventController } from './event.controller';
import { Event, EventSchema } from './event.model';
import { EventService } from './event.service';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads/events');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    MulterModule.register(multerConfig),
    NotificationModule,
    UserModule,
    UploadModule,
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}

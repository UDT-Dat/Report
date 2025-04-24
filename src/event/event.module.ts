import { BadRequestException, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event, EventSchema } from './event.model';
import * as fs from 'fs';
import * as path from 'path';
import { extname } from 'path';
// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads/events');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          // Tạo tên file ngẫu nhiên để tránh trùng lặp
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      })
    })
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule { }

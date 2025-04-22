import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Post, PostSchema } from './models/post.model';
import { Media, MediaSchema } from './models/media.model';
import { Library, LibrarySchema } from './library.model';
/**
 * import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event, EventSchema } from './event.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService]
})
export class EventModule { }

 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Media.name, schema: MediaSchema },
      {name: Library.name, schema: LibrarySchema}
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}`);
        },
      }),
    }),
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}

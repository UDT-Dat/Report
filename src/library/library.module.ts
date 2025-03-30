import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Post, PostSchema } from './models/post.model';
import { Media, MediaSchema } from './models/media.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Media.name, schema: MediaSchema },
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
})
export class LibraryModule {}

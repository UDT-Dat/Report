import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { Post, PostSchema } from './post.model';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { multerConfig } from './config/multer.config';
import * as fs from 'fs';
import * as path from 'path';
import { AttachmentModule } from 'src/attachment/attachment.module';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads/posts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MulterModule.register(multerConfig),
    AttachmentModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}

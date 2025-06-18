import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UploadModule } from 'src/upload/upload.module';
import { multerConfig } from './config/multer.config';
import { PostController } from './post.controller';
import { Post, PostSchema } from './post.model';
import { PostService } from './post.service';

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
    NotificationModule,
    UploadModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '7d' }, // Shorter expiration for access tokens
      }),
    }),
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}

import { diskStorage } from 'multer';
import { extname } from 'path';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UserSchema } from 'src/user/user.model';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import {
  Library,
  LibrarySchema,
} from './models/library.model';
import {
  Permission,
  PermissionSchema,
} from './models/permission.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Library.name, schema: LibrarySchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: 'User', schema: UserSchema },
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/attachments',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
    AttachmentModule,
    NotificationModule,
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}

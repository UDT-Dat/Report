import { AttachmentModule } from 'src/attachment/attachment.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UserSchema } from 'src/user/user.model';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

import { multerConfig } from './config/multer.config';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Library, LibrarySchema } from './models/library.model';
import { Permission, PermissionSchema } from './models/permission.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Library.name, schema: LibrarySchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: 'User', schema: UserSchema },
    ]),
    MulterModule.register(multerConfig),
    AttachmentModule,
    NotificationModule,
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}

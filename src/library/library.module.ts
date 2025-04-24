import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Library, LibrarySchema } from './models/library.model';
import { Attachment, AttachmentSchema } from './models/attachment.model';
import { Permission, PermissionSchema } from './models/permission.model';
import { extname } from 'path';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Library.name, schema: LibrarySchema },
      { name: Attachment.name, schema: AttachmentSchema },
      { name: Permission.name, schema: PermissionSchema }
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
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule { }

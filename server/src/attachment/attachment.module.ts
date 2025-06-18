import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadModule } from 'src/upload/upload.module';
import { Attachment, AttachmentSchema } from './attachment.model';
import { AttachmentService } from './attachment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attachment.name, schema: AttachmentSchema },
    ]),
    UploadModule,
  ],
  providers: [AttachmentService],
  exports: [AttachmentService],
})
export class AttachmentModule {}

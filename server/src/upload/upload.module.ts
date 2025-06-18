import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { uploadConfig } from './config/upload.config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [MulterModule.register(uploadConfig)],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService, MulterModule],
})
export class UploadModule {}

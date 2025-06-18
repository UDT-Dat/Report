import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { NotificationModule } from 'src/notification/notification.module';
import { UploadModule } from 'src/upload/upload.module';
import { multerConfig } from './config/multer.config';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.model';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationModule,
    MulterModule.register(multerConfig),
    UploadModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './event/event.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LibraryModule } from './library/library.module';
import { PostModule } from './post/post.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb+srv://project_admin:%2Aproject_admin%40123@cluster0.nkrrf.mongodb.net/graduation_project',
    ),
    EventModule,
    UserModule,
    AuthModule,
    LibraryModule,
    PostModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

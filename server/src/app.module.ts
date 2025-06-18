import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { EventModule } from './event/event.module';
import { LibraryModule } from './library/library.module';
import { LikeModule } from './like/like.module';
import { NotificationModule } from './notification/notification.module';
import { PostModule } from './post/post.module';
import { SearchModule } from './search/search.module';
import { StatsModule } from './stats/stats.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb+srv://project_admin:%2Aproject_admin%40123@cluster0.nkrrf.mongodb.net/graduation_project',
      {
        connectionFactory: (connection: Connection): Connection => {
          connection.set('debug', true);
          return connection;
        },
      },
    ),
    EventModule,
    UserModule,
    AuthModule,
    LibraryModule,
    PostModule,
    NotificationModule,
    CommentModule,
    LikeModule,
    UploadModule,
    StatsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User, UserSchema } from '../user/user.model';
import { Post, PostSchema } from '../post/post.model';
import { Event, EventSchema } from '../event/event.model';
import { Library, LibrarySchema } from '../library/models/library.model';
import {
  Permission,
  PermissionSchema,
} from '../library/models/permission.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Event.name, schema: EventSchema },
      { name: Library.name, schema: LibrarySchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}

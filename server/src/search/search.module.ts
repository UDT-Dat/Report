import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from 'src/event/event.model';
import { Library, LibrarySchema } from 'src/library/models/library.model';
import { Post, PostSchema } from 'src/post/post.model';
import { User, UserSchema } from 'src/user/user.model';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Event.name, schema: EventSchema },
      { name: Post.name, schema: PostSchema },
      { name: Library.name, schema: LibrarySchema },
    ]),
  ],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}

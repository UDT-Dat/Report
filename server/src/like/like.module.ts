import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LikeController } from './like.controller';
import { Like, LikeSchema } from './like.model';
import { LikeService } from './like.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
  ],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}

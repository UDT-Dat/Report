import { IsMongoId, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateLikeDto {
  @ApiProperty({ description: 'The ID of the post to like' })
  @IsMongoId()
  @IsNotEmpty()
  postId: string;
}

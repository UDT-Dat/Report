import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'The content of the comment' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The ID of the post this comment belongs to' })
  @IsMongoId()
  @IsNotEmpty()
  postId: string;
}

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

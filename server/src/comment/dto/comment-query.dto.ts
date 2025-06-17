import { Type } from 'class-transformer';
import { IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CommentQueryDto {
  @ApiProperty({
    description: 'The ID of the post to filter comments by',
    required: true,
  })
  @IsMongoId()
  postId: string;

  @ApiProperty({ description: 'The page number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'The number of items per page',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

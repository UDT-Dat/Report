import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: 'Title of the post' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Content of the post' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Array of attachment URLs', required: false })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: 'The title of the post' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The content of the post' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'Featured image URL for the post', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
} 
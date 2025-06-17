import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: 'The title of the post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The content of the post' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

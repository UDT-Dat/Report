import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({ description: 'The title of the post', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'The content of the post', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'Featured image URL for the post', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
} 
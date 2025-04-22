import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({ description: 'Title of the post', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Content of the post', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'Array of attachment URLs', required: false })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}

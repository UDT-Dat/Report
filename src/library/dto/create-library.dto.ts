import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLibraryDto {
  @ApiProperty({ description: 'The title of the resource' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The description of the resource', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The file URL or path of the resource' })
  @IsNotEmpty()
  @IsString()
  fileUrl: string;

  @ApiProperty({ description: 'The type of the resource (pdf, doc, video, etc)', required: false })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiProperty({ description: 'The size of the file in bytes', required: false })
  @IsOptional()
  fileSize?: number;
} 
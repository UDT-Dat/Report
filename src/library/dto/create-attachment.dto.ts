import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateAttachmentDto {
  @ApiProperty({ description: 'The ID of the library this attachment belongs to' })
  @IsNotEmpty()
  @IsString()
  libraryId: string;

  @ApiProperty({ description: 'Description of the attachment', required: false })
  @IsOptional()
  @IsString()
  description?: string;
} 
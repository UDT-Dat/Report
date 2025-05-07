import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLibraryDto {
  @ApiProperty({ description: 'The title of the resource', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'The description of the resource',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

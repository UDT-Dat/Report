import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLibraryDto {
  @ApiProperty({ description: 'The title of the resource' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the resource',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

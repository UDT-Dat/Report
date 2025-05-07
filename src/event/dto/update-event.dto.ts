import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({ description: 'The title of the event', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'The description of the event', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The location of the event', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'The start date and time of the event',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({
    description: 'The end date and time of the event',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({
    description: 'The maximum number of participants',
    required: false,
  })
  @IsOptional()
  maxParticipants?: number;
}

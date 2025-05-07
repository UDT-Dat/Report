import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'The title of the event' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The description of the event' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'The location of the event' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ description: 'The start date and time of the event' })
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'The end date and time of the event' })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @ApiProperty({
    description: 'The maximum number of participants',
    required: false,
  })
  @IsOptional()
  maxParticipants?: number;
}

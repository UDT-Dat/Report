import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { EventStatus } from '../event.model';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({ description: 'The title of the event' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the event' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Start date and time of the event' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'End date and time of the event' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ description: 'Location where the event will be held' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'The URL of the event image', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Maximum number of participants allowed',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxParticipants?: number;

  @ApiProperty({
    description: 'Additional notes or requirements for the event',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateEventDto {
  @ApiProperty({ description: 'The title of the event', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Detailed description of the event',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Start date and time of the event',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'End date and time of the event',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({
    description: 'Location where the event will be held',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'The URL of the event image', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Maximum number of participants allowed',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxParticipants?: number;

  @ApiProperty({
    description: 'Current status of the event',
    enum: EventStatus,
    required: false,
  })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}

export class RegisterEventDto {
  @ApiProperty({ description: 'The ID of the user registering for the event' })
  @IsString()
  userId: string;
}

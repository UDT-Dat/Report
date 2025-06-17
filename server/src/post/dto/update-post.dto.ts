import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({ description: 'The title of the post', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'The content of the post', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Array if of attachment you want to remove',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    // Handle array with potentially comma-separated values
    if (Array.isArray(value)) {
      const result: string[] = [];
      value.forEach((item) => {
        if (typeof item === 'string' && item.includes(',')) {
          result.push(...item.split(','));
        } else {
          result.push(item);
        }
      });
      return result;
    }
    // Handle string with comma-separated values
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',');
    }
    // Handle single value
    let arr: unknown[] = [];
    if (value) {
      arr = Array.isArray(value) ? value : [value];
    }
    // Ensure all values are strings
    return arr.map((item) => String(item));
  })
  @IsArray()
  removeAttachments?: string[];
}

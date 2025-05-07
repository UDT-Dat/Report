import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token to use for obtaining a new access token',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

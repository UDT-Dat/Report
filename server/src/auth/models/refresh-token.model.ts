import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken {
  @ApiProperty({ description: 'The unique identifier for the refresh token' })
  @Prop({ required: true })
  id: string;

  @ApiProperty({ description: 'The refresh token value' })
  @Prop({ required: true })
  token: string;

  @ApiProperty({ description: 'The user ID associated with this token' })
  @Prop({ required: true })
  userId: string;

  @ApiProperty({ description: 'When the token expires' })
  @Prop({ required: true })
  expiresAt: Date;

  @ApiProperty({ description: 'Whether the token has been revoked' })
  @Prop({ default: false })
  isRevoked: boolean;

  @ApiProperty({ description: 'The timestamp when the token was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The timestamp when the token was last updated' })
  updatedAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

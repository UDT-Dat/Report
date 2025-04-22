import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MemberDocument = Member & Document;

@Schema({ timestamps: true })
export class Member {
  @ApiProperty({ description: 'The unique identifier of the member' })
  @Prop()
  id: string;

  @ApiProperty({ description: 'The full name of the member' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'The email address of the member' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ description: 'The phone number of the member' })
  @Prop({ required: true })
  phone: string;

  @ApiProperty({ description: 'The address of the member' })
  @Prop()
  address: string;

  @ApiProperty({ description: 'The timestamp when the member was created' })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the member was last updated',
  })
  updatedAt: Date;
}

export const MemberSchema = SchemaFactory.createForClass(Member);

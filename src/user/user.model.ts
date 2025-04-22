import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  MEMBER = 'member',
  MENTOR = 'mentor',
  ADMIN = 'admin',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ description: 'The unique identifier of the user' })
  @Prop()
  id: string;

  @ApiProperty({ description: 'The full name of the user' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'The email address of the user' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @Prop({ required: true })
  password: string;

  @ApiProperty({ description: 'The phone number of the user' })
  @Prop()
  phone: string;

  @ApiProperty({ description: 'The address of the user' })
  @Prop()
  address: string;

  @ApiProperty({ enum: UserRole, description: 'The role of the user' })
  @Prop({ type: String, enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, description: 'The status of the user' })
  @Prop({ type: String, enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @ApiProperty({ description: 'The timestamp when the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The timestamp when the user was last updated' })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); 
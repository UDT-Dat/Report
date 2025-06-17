import { Document, Schema as MongooseSchema } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum UserRole {
  MEMBER = 'member',
  BOD = 'bod',
  ADMIN = 'admin',
}

export enum UserStatus {
  PENDING = 'pending',
  VERIFYING = 'verifying',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REJECTED = 'rejected',
}

export enum UserVerificationStatus {
  UNVERIFIED = 'unverified',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_: any, ret: Record<string, unknown>) => {
      ret['userId'] = ret['_id'];
      return ret;
    },
  },
})
export class User {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: string;

  userId: string;

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

  @ApiProperty({ description: 'The last login timestamp of the user' })
  @Prop({ type: Date, default: Date.now })
  lastLogin: Date;

  @ApiProperty({ description: 'The avatar URL of the user' })
  @Prop({
    default:
      'https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-6/453100544_1032163772246781_3779010236872632932_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=515elx0vffoQ7kNvwEhAx8m&_nc_oc=AdniFBPcpkSDYgiBRDBwzZlo3_5UfUZqOWlYrW7fK56Pzpx27emKGYxqavZ6XkDLEoU&_nc_zt=23&_nc_ht=scontent.fsgn5-14.fna&_nc_gid=Q3WivR55_k0XLOaCk0O7Hg&oh=00_AfMxXYePpgW_mcZovgHJUqvESNcq9jeHkZ8MwjO6zJCaPA&oe=6856FDC3',
  })
  avatar?: string;

  @ApiProperty({ description: 'The cover image URL of the user' })
  @Prop()
  coverImage?: string;

  @ApiProperty({ description: 'The GitHub username of the user' })
  @Prop({
    description: 'The GitHub username of the user',
    required: false,
  })
  studentCode?: string;

  @ApiProperty({ description: 'The course of the user' })
  @Prop({ required: false })
  course: string;

  @ApiProperty({ description: 'The student card image URL of the user' })
  @Prop({
    required: false,
  })
  studentCard?: string;

  @ApiProperty({ description: 'The rejection reason of the user' })
  @Prop({
    type: String,
    required: false,
    default: '',
  })
  rejectReason?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

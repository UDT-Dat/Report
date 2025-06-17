import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type PermissionDocument = Permission & Document;

export enum PermissionType {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class Permission {
  @ApiProperty({ description: 'The library this permission applies to' })
  @Prop({ type: Types.ObjectId, ref: 'Library', required: true })
  library: Types.ObjectId;

  @ApiProperty({ description: 'The user who has access' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @ApiProperty({ description: 'The user who granted this permission' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  grantedBy: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

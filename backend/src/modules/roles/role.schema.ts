// src/roles/schemas/role.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [String], default: [] })
  permissions: string[]; // ✅ هنا التخزين

  @Prop()
  description: string; // ✅ جديد
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false }) // ✅ جديد
  isArchived: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone: string;

  @Prop()
  gender: string;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  address: string;

  // 🔥 patient fields
  @Prop()
  medicalRecordNumber: string;

  @Prop()
  emergencyContact: string;

  @Prop()
  insuranceProvider: string;

  @Prop()
  insuranceNumber: string;

  @Prop()
  photo: string;

  // relations
  @Prop()
  serviceId: string;

  @Prop()
  doctorId: string;

  @Prop()
  nurseId: string;

  @Prop()
  coordinatorId: string;

@Prop({ type: Types.ObjectId, ref: 'Role', required: true })
role: Types.ObjectId;

}

export const UserSchema = SchemaFactory.createForClass(User);
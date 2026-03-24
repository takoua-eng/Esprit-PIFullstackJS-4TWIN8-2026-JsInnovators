import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {

  _id: Types.ObjectId;

  // 👤 Infos personnelles
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  photo?: string;

  @Prop()
  phone?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop({ enum: ['male', 'female'] })
  gender?: string;

  // 🔐 Auth
  @Prop({ required: true })
  password: string;

@Prop({ type: String, default: null })
resetToken: string | null;

  // 🔗 Role (relation)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null })
  role: Types.ObjectId | null;

  // 🏥 Infos médicales
  @Prop()
  medicalRecordNumber?: string;

  @Prop()
  specialization?: string;

  @Prop()
  department?: string;

  // 👥 Liste des patients (relation)
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] })
  assignedPatients: Types.ObjectId[];

  // 📍 Contact
  @Prop()
  address?: string;

  @Prop()
  emergencyContact?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
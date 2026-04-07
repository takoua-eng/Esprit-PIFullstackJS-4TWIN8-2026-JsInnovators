import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true })
  userId: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone: string;

  @Prop({ enum: ['male', 'female'] })
  gender: string;

  @Prop()
  address: string;

  @Prop()
  photo: string;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  nurseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  coordinatorId: Types.ObjectId;

  // ── PATIENT ──────────────────────────────────────────────
  @Prop()
  dateOfBirth: Date;

  @Prop()
  medicalRecordNumber: string;

  @Prop()
  emergencyContact: string;

  @Prop()
  insuranceProvider: string;

  @Prop()
  insuranceNumber: string;

  // ── DOCTOR ───────────────────────────────────────────────
  @Prop()
  specialization: string;

  @Prop()
  licenseNumber: string;

  @Prop()
  yearsOfExperience: number;

  // ── NURSE ────────────────────────────────────────────────
  @Prop()
  department: string;

  @Prop()
  shift: string;

  // ── COORDINATOR ──────────────────────────────────────────
  @Prop({ type: Types.ObjectId, ref: 'Service' })
  assignedService: Types.ObjectId;

  @Prop()
  responsibilities: string;

  // ── ADMIN ────────────────────────────────────────────────
  @Prop({ default: false })
  isSuperAdmin: boolean;

  @Prop()
  adminLevel: string;

  // ── AUDITOR ──────────────────────────────────────────────
  @Prop()
  auditLevel: string;

  // ── COMMON ───────────────────────────────────────────────
  @Prop({ default: false })
  isArchived: boolean;

  @Prop()
  nationalId: string;

  @Prop()
  age: number;

  @Prop({ enum: ['single', 'married', 'divorced'] })
  maritalStatus: string;

  @Prop({ type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  // ── assignedPatients avec default: [] ────────────────────
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
  assignedPatients: mongoose.Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.Mixed })
  nurseDossier?: Record<string, unknown>;

  @Prop({ type: [Number], default: [] })
  faceDescriptor: number[];
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Role } from '../roles/role.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  // 🔹 ID
  @Prop({ unique: true })
  userId: string;

  // 🔹 COMMON
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

  // 🔥 photo لكل users
  @Prop()
  photo: string;

  // 🔹 ROLE
  @Prop({ type: Types.ObjectId, ref: Role.name, required: true })
  role: Types.ObjectId;

  // 🔹 RELATIONS
  @Prop({ type: Types.ObjectId, ref: 'User' })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  nurseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  coordinatorId: Types.ObjectId;

  // =========================
  // 🔴 PATIENT
  // =========================
  @Prop()
  dateOfBirth: Date; // 🔥 added

  @Prop()
  medicalRecordNumber: string;

  @Prop()
  emergencyContact: string;

  @Prop()
  insuranceProvider: string;

  @Prop()
  insuranceNumber: string;

  // =========================
  // 🔵 DOCTOR
  // =========================
  @Prop()
  specialization: string;

  @Prop()
  licenseNumber: string;

  @Prop()
  yearsOfExperience: number;

  // =========================
  // 🟢 NURSE
  // =========================
  @Prop()
  department: string;

  @Prop()
  shift: string;

  // =========================
  // 🟣 COORDINATOR
  // =========================
  @Prop()
  assignedService: string;

  @Prop()
  responsibilities: string;

  // =========================
  // ⚫ ADMIN
  // =========================
  @Prop({ default: false })
  isSuperAdmin: boolean;

  @Prop()
  adminLevel: string; // 🔥 new (level1, level2...)

  // =========================
  // ⚪ AUDITOR
  // =========================
  @Prop()
  auditLevel: string;
  @Prop({ default: false })
  isArchived: boolean;
  @Prop()
  nationalId: string; // CIN
  @Prop()
  age: number;

  @Prop({ enum: ['single', 'married', 'divorced'] })
  maritalStatus: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, ref: 'Service', default: undefined })
  serviceId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  assignedPatients: mongoose.Types.ObjectId[];

  /** Nurse medical dossier (globals); per-visit diagnoses live in `patientdiagnoses`. */
  @Prop({ type: mongoose.Schema.Types.Mixed })
  nurseDossier?: Record<string, unknown>;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Clean invalid serviceId before any populate can fail
UserSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  // If the query filter contains serviceId, validate it
  const filter = (this as any).getFilter?.() ?? {};
  if (filter.serviceId && !require('mongoose').Types.ObjectId.isValid(filter.serviceId)) {
    (this as any).setQuery({ ...filter, serviceId: undefined });
  }
});

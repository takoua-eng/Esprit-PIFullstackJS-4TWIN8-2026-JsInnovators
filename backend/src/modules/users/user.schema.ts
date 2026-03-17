import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../roles/role.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  userId: string; // e.g. mediflow1, mediflow2 (never reused after delete)

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

  @Prop()
  gender?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, default: null })
  resetToken: string | null;

  // ⚠️ Ici on stocke juste l'id du rôle
  @Prop({ type: Types.ObjectId, ref: Role.name })
  role: Types.ObjectId | Role;

  @Prop()
  medicalRecordNumber?: string;

  @Prop()
  specialization?: string;

  @Prop()
  department?: string;

  @Prop()
  assignedPatients?: string;

  @Prop()
  address?: string;

  @Prop()
  emergencyContact?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Computed age from dateOfBirth (in years)
UserSchema.virtual('age').get(function (this: UserDocument) {
  const dob = this.dateOfBirth;
  if (!dob) return undefined;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

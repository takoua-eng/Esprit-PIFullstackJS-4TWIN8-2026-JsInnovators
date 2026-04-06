// src/modules/patient/schemas/symptoms.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SymptomsDocument = Symptoms & Document;

@Schema({ timestamps: true, collection: 'symptoms' })
export class Symptoms {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId; // Patient concerné

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedBy: Types.ObjectId; // Qui a reporté: patient, nurse ou physician

  @Prop({ type: [String], required: true })
  symptoms: string[]; // e.g. ["pain", "fatigue", "nausea"]

  @Prop({ type: Number, required: true, min: 0, max: 10 })
  painLevel: number; // 0-10 scale

  @Prop({ type: Number, required: true, min: 0, max: 10 })
  fatigueLevel: number; // 0-10 scale

  @Prop({ type: Boolean, required: true })
  shortnessOfBreath: boolean;

  @Prop({ type: Boolean, required: true })
  nausea: boolean;

  @Prop()
  description?: string; // texte libre, optionnel

  @Prop({ type: Date, required: true })
  reportedAt: Date; // date de saisie

  @Prop({ enum: ['patient', 'nurse_assisted'], default: 'patient' })
  entrySource?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId;

  @Prop()
  verifiedAt?: Date;
}

export const SymptomsSchema = SchemaFactory.createForClass(Symptoms);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AutoAlertDocument = AutoAlert & Document;

export enum AutoAlertStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
}

export enum AutoAlertType {
  VITAL = 'vital',
  SYMPTOM = 'symptom',
}

@Schema({ collection: 'auto-alerts', timestamps: true })
export class AutoAlert {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true, enum: AutoAlertType })
  type: AutoAlertType;

  @Prop({ required: true })
  parameter: string; // e.g. 'temperature', 'heartRate', 'painLevel'

  @Prop()
  value?: number; // valeur qui a declenche l'alerte

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: AutoAlertStatus, default: AutoAlertStatus.PENDING })
  status: AutoAlertStatus;
}

export const AutoAlertSchema = SchemaFactory.createForClass(AutoAlert);

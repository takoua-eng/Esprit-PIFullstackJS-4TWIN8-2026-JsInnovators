import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VitalDocument = Vital & Document;

@Schema({ timestamps: true, collection: 'vitals' })
export class Vital {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  /** User who saved this reading (patient or nurse). */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recordedBy: Types.ObjectId;

  @Prop({ enum: ['patient', 'nurse_assisted'], default: 'patient' })
  entrySource: string;

  @Prop()
  temperature?: number;

  @Prop()
  bloodPressure?: string;

  @Prop()
  weight?: number;

  @Prop()
  heartRate?: number;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  recordedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId;

  @Prop()
  verifiedAt?: Date;
}

export const VitalSchema = SchemaFactory.createForClass(Vital);

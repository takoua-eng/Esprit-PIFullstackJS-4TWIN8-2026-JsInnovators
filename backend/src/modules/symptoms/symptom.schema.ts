import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SymptomDocument = Symptom & Document;

@Schema({ timestamps: true })
export class Symptom {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedBy: Types.ObjectId;

  @Prop({ enum: ['patient', 'nurse_assisted'], default: 'patient' })
  entrySource: string;

  @Prop({ type: [String], default: [] })
  symptoms: string[];

  @Prop()
  painLevel?: number;

  @Prop()
  description?: string;

  @Prop({ required: true })
  reportedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId;

  @Prop()
  verifiedAt?: Date;
}

export const SymptomSchema = SchemaFactory.createForClass(Symptom);

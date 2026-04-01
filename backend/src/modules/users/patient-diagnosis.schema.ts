import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PatientDiagnosisDocument = PatientDiagnosis & Document;

@Schema({ timestamps: true, collection: 'patientdiagnoses' })
export class PatientDiagnosis {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  entryId: string;

  @Prop()
  admissionDate?: string;

  @Prop()
  dischargeDate?: string;

  @Prop()
  dischargeUnit?: string;

  @Prop()
  primaryDiagnosis?: string;

  @Prop()
  hospitalizationReason?: string;

  @Prop()
  secondaryDiagnoses?: string;

  @Prop()
  proceduresPerformed?: string;

  @Prop()
  dischargeSummaryNotes?: string;
}

export const PatientDiagnosisSchema =
  SchemaFactory.createForClass(PatientDiagnosis);

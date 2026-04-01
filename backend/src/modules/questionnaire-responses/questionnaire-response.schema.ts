import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionnaireResponseDocument = QuestionnaireResponse & Document;

@Schema({ timestamps: true })
export class QuestionnaireResponse {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'QuestionnaireTemplate', default: null })
  templateId: Types.ObjectId | null;

  // Responses as key/value { q1: '8', q2: 'Yes', ... }
  @Prop({ type: Object, required: true })
  answers: Record<string, string>;

  @Prop({ required: true })
  submittedAt: Date;
}

export const QuestionnaireResponseSchema =
  SchemaFactory.createForClass(QuestionnaireResponse);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AnswerItem, AnswerItemSchema } from './answer-item.schema';

export type QuestionnaireResponseDocument = QuestionnaireResponse & Document;

@Schema({ timestamps: true })
export class QuestionnaireResponse {
  @Prop({
    type: Types.ObjectId,
    ref: 'QuestionnaireInstance',
    required: true,
  })
  questionnaireInstanceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;          // The patient who submitted the response

  @Prop({ type: Object, required: true })
  answers: Record<string, any>;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;           // The doctor who assigned/sent the questionnaire

  // Optional: track if the doctor has reviewed the response
  @Prop({ default: false })
  reviewedByDoctor: boolean;

  // Optional: doctor's notes after reviewing
  @Prop()
  doctorNotes?: string;
}

export const QuestionnaireResponseSchema = SchemaFactory.createForClass(QuestionnaireResponse);
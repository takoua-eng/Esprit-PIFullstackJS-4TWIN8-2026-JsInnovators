import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Question, QuestionSchema } from '../questionnaire-question/question.schema';

export type QuestionnaireInstanceDocument = QuestionnaireInstance & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class QuestionnaireInstance {
  @Prop({ type: Types.ObjectId, ref: 'QuestionnaireTemplate', required: true })
  templateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: [QuestionSchema], default: [] })
  questions: Question[];
}

export const QuestionnaireInstanceSchema =
  SchemaFactory.createForClass(QuestionnaireInstance);

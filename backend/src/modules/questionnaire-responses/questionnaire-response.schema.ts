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
  patientId: Types.ObjectId;

  @Prop({ type: [AnswerItemSchema], required: true })
  answers: AnswerItem[];
}

export const QuestionnaireResponseSchema =
  SchemaFactory.createForClass(QuestionnaireResponse);

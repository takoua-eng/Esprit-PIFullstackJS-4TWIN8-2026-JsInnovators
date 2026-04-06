import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Question, QuestionSchema } from '../questionnaire-question/question.schema';

export type QuestionnaireTemplateDocument = QuestionnaireTemplate & Document;

@Schema()
export class QuestionnaireTemplate {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, default: false })
  allowDoctorToAddQuestions: boolean;

  @Prop({ type: [QuestionSchema], default: [] })
  questions: Question[];
}

export const QuestionnaireTemplateSchema =
  SchemaFactory.createForClass(QuestionnaireTemplate);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionnaireDocument = Questionnaire & Document;

export interface AnswerItem {
  questionKey: string;
  answer: string | number;
}

@Schema({ timestamps: true })
export class Questionnaire {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: [Object], required: true })
  answers: AnswerItem[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'QuestionnaireTemplate' })
  templateId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  submittedBy?: Types.ObjectId;

  @Prop({ default: 'pending' })
  status: 'pending' | 'completed' | 'reviewed';

  @Prop()
  submittedAt?: Date;
}

export const QuestionnaireSchema = SchemaFactory.createForClass(Questionnaire);
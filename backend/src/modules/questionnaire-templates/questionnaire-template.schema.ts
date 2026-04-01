import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionnaireTemplateDocument = QuestionnaireTemplate & Document;

export interface QuestionItem {
  key: string;
  text: string;
  type: 'text' | 'radio' | 'scale';
  options?: string[];
  min?: number;
  max?: number;
}

@Schema({ timestamps: true })
export class QuestionnaireTemplate {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: [Object], required: true })
  questions: QuestionItem[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  assignedTo: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  active: boolean;
}

export const QuestionnaireTemplateSchema =
  SchemaFactory.createForClass(QuestionnaireTemplate);
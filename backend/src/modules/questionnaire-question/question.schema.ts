import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type QuestionType =
  | 'text'
  | 'number'
  | 'single_choice'
  | 'multiple_choice';

@Schema()
export class Question {
  @Prop({ required: true })
  label: string;

  @Prop({
    required: true,
    enum: ['text', 'number', 'single_choice', 'multiple_choice'],
  })
  type: QuestionType;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ required: true, default: false })
  required: boolean;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

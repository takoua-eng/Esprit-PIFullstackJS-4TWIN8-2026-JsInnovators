import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ _id: false })
export class AnswerItem {
  @Prop({ type: Types.ObjectId, required: true })
  questionId: Types.ObjectId;

  /** text / single_choice: string · number: number · multiple_choice: string[] */
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: string | number | string[];
}

export const AnswerItemSchema = SchemaFactory.createForClass(AnswerItem);

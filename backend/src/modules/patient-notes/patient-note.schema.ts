import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PatientNoteDocument = PatientNote & Document;

@Schema({ timestamps: true })
export class PatientNote {
  @Prop({ required: true, type: Types.ObjectId })
  fromUserId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  toUserId: Types.ObjectId;

  @Prop({ required: true })
  message: string;
}

export const PatientNoteSchema = SchemaFactory.createForClass(PatientNote);
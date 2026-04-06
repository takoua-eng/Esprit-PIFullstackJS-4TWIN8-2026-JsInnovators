import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReminderDocument = Reminder & Document;

@Schema({ timestamps: true })
export class Reminder {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sentBy: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['vital_entry', 'questionnaire', 'follow_up'],
    required: true,
  })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: ['scheduled', 'sent', 'cancelled'],
    default: 'scheduled',
  })
  status: string;

  @Prop()
  scheduledAt?: Date;

  @Prop()
  sentAt?: Date;

  // ── Notification tracking ─────────────────────────────
  @Prop({ default: false })
  emailSent: boolean;

  @Prop()
  emailSentAt?: Date;

  @Prop({ default: false })
  smsSent: boolean;

  @Prop()
  smsSentAt?: Date;

  @Prop()
  smsScheduledAt?: Date; // quand le SMS doit être envoyé si non-compliance

  @Prop({ default: false })
  smsJobDone: boolean; // true = le job SMS a déjà tourné pour ce reminder
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VideoCallInviteDocument = VideoCallInvite & Document;

@Schema({ timestamps: true, collection: 'videocallinvites' })
export class VideoCallInvite {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  physicianUserId: Types.ObjectId;

  /** Same convention as the doctor UI: EspritCare-{patientId}-{physicianUserId} */
  @Prop({ required: true })
  roomName: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date })
  dismissedAt?: Date;
}

export const VideoCallInviteSchema =
  SchemaFactory.createForClass(VideoCallInvite);

VideoCallInviteSchema.index({ patientId: 1, dismissedAt: 1, expiresAt: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TrafficEventDocument = TrafficEvent & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'traffic_events' })
export class TrafficEvent {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  /** Identifiant de session (ex. cookie) pour regrouper les vues */
  @Prop({ required: true })
  sessionId: string;

  @Prop({ enum: ['visit', 'pageview'], default: 'pageview' })
  kind: 'visit' | 'pageview';

  @Prop()
  path?: string;
}

export const TrafficEventSchema = SchemaFactory.createForClass(TrafficEvent);

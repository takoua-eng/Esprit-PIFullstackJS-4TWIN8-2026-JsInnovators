import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop()
  userId: string;

  @Prop()
  userEmail: string;

  @Prop()
  action: string;

  @Prop()
  entityType: string;

  @Prop()
  entityId: string;

  @Prop({ type: Object })
  before: any;

  @Prop({ type: Object })
  after: any;

  @Prop()
  ipAddress: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  // QUI
  @Prop() userId:    string;
  @Prop() userEmail: string;
  @Prop() userRole:  string;   // doctor, nurse, admin...
  @Prop() userName:  string;   // firstName + lastName

  // QUOI
  @Prop() action: string;      // CREATE, UPDATE, DELETE, LOGIN...

  // SUR QUOI
  @Prop() entityType: string;  // USERS_PATIENTS, VITALS...
  @Prop() entityId:   string;

  // CHANGEMENTS
  @Prop({ type: Object }) before: any;
  @Prop({ type: Object }) after:  any;

  // OÙ
  @Prop() ipAddress:  string;
  @Prop() userAgent:  string;  // browser/device info
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

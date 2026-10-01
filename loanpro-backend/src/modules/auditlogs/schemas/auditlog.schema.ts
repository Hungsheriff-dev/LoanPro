import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  action: string; // CREATE_LOAN, APPROVE, DISBURSE, UPDATE...

  @Prop({ required: true })
  entity: string; // LoanApplication, Loan, Customer...

  @Prop({ type: Types.ObjectId })
  entityId: Types.ObjectId;

  @Prop()
  description: string;

  @Prop({ type: Object })
  oldValue: Record<string, any>;

  @Prop({ type: Object })
  newValue: Record<string, any>;

  @Prop()
  ipAddress: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
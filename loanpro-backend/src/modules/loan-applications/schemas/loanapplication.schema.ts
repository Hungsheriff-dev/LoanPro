// src/modules/loan-applications/schemas/loan-application.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoanApplicationDocument = LoanApplication & Document;

@Schema({ timestamps: true })
export class LoanApplication {
  @Prop({ required: true, unique: true })
  applicationId: string;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customer: Types.ObjectId;

  @Prop({ 
    required: true, 
    enum: ['PERSONAL', 'BUSINESS', 'MORTGAGE', 'CAR', 'OTHER'] 
  })
  loanType: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  tenure: number; // số tháng

  @Prop()
  interestRate: number;

  @Prop()
  purpose: string;

  @Prop({ 
    default: 'DRAFT',
    enum: ['DRAFT', 'PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'DISBURSED'] 
  })
  status: string;

  @Prop()
  currentStep: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  submittedBy: Types.ObjectId;

  @Prop()
  submittedAt: Date;

  @Prop([{
    user: { type: Types.ObjectId, ref: 'User' },
    action: { type: String, enum: ['APPROVE', 'REJECT', 'REQUEST_MORE_INFO'] },
    comment: String,
    date: Date
  }])
  reviewedBy: Array<{
    user: Types.ObjectId;
    action: string;
    comment?: string;
    date: Date;
  }>;
}

export const LoanApplicationSchema = SchemaFactory.createForClass(LoanApplication);
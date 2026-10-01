import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoanDocument = Loan & Document;

@Schema({ timestamps: true })
export class Loan {
  @Prop({ required: true, unique: true })
  loanId: string;

  @Prop({ type: Types.ObjectId, ref: 'LoanApplication' })
  application: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customer: Types.ObjectId;

  @Prop({ required: true })
  principalAmount: number;

  @Prop()
  disbursedAmount: number;

  @Prop()
  disbursedDate: Date;

  @Prop()
  tenure: number; // số tháng

  @Prop()
  interestRate: number;

  @Prop({
    default: 'ACTIVE',
    enum: ['ACTIVE', 'COMPLETED', 'OVERDUE', 'CLOSED'],
  })
  status: string;

  @Prop({ default: 0 })
  totalRepaid: number;

  @Prop()
  remainingBalance: number;
}

export const LoanSchema = SchemaFactory.createForClass(Loan);
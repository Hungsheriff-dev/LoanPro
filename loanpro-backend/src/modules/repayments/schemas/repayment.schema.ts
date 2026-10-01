import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RepaymentScheduleDocument = RepaymentSchedule & Document;

@Schema({ timestamps: true })
export class RepaymentSchedule {
  @Prop({ type: Types.ObjectId, ref: 'Loan', required: true })
  loan: Types.ObjectId;

  @Prop({ required: true })
  installmentNumber: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ required: true })
  principal: number;

  @Prop({ required: true })
  interest: number;

  @Prop({ required: true })
  totalPayment: number;

  @Prop({
    default: 'PENDING',
    enum: ['PENDING', 'PAID', 'OVERDUE'],
  })
  status: string;

  @Prop()
  paidDate: Date;

  @Prop()
  paidAmount: number;
}

export const RepaymentScheduleSchema = SchemaFactory.createForClass(RepaymentSchedule);
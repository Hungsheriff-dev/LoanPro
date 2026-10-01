// src/modules/customers/schemas/customer.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true, unique: true })
  customerId: string; // CUS-00001

  @Prop({ required: true })
  fullName: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ required: true, unique: true })
  identityNumber: string; // CMND/CCCD

  @Prop({ required: true })
  phone: string;

  @Prop()
  email: string;

  @Prop()
  address: string;

  @Prop()
  occupation: string;

  @Prop()
  monthlyIncome: number;

  @Prop()
  creditScore: number;

  @Prop({
    default: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'BLACKLIST'],
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
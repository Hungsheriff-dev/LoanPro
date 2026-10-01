import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import {
  LoanApplication,
  LoanApplicationSchema,
} from '../loan-applications/schemas/loanapplication.schema';
import { Loan, LoanSchema } from '../loans/schemas/loan.schema';
import {
  RepaymentSchedule,
  RepaymentScheduleSchema,
} from '../repayments/schemas/repayment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: LoanApplication.name, schema: LoanApplicationSchema },
      { name: Loan.name, schema: LoanSchema },
      { name: RepaymentSchedule.name, schema: RepaymentScheduleSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
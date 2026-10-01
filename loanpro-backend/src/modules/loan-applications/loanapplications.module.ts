import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LoanApplication,
  LoanApplicationSchema,
} from './schemas/loanapplication.schema';
import { Loan, LoanSchema } from '../loans/schemas/loan.schema';
import {
  RepaymentSchedule,
  RepaymentScheduleSchema,
} from '../repayments/schemas/repayment.schema';
import { LoanApplicationsService } from './loan-applications.service';
import { LoanApplicationsController } from './loan-applications.controller';
import { CustomersModule } from '../customers/customers.module';
import { AuditLogsModule } from '../auditlogs/audit-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoanApplication.name, schema: LoanApplicationSchema },
      { name: Loan.name, schema: LoanSchema },                 // ← Thêm dòng này
      { name: RepaymentSchedule.name, schema: RepaymentScheduleSchema }, // ← Thêm dòng này
    ]),
    CustomersModule,
    AuditLogsModule,
  ],
  controllers: [LoanApplicationsController],
  providers: [LoanApplicationsService],
  exports: [LoanApplicationsService],
})
export class LoanApplicationsModule {}
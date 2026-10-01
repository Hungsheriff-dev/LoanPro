import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RepaymentSchedule,
  RepaymentScheduleSchema,
} from './schemas/repayment.schema';
import { Loan, LoanSchema } from '../loans/schemas/loan.schema';
import { RepaymentsService } from './repayments.service';
import { RepaymentsController } from './repayments.controller';
import { AuditLogsModule } from '../auditlogs/audit-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RepaymentSchedule.name, schema: RepaymentScheduleSchema },
      { name: Loan.name, schema: LoanSchema }, // Cần để cập nhật số dư khoản vay
    ]),
    AuditLogsModule,
  ],
  controllers: [RepaymentsController],
  providers: [RepaymentsService],
  exports: [RepaymentsService],
})
export class RepaymentsModule {}
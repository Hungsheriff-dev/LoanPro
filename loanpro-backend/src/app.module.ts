import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { RepaymentsModule } from './modules/repayments/repayments.module';
import { LoansModule } from './modules/loans/loans.module';
import { AuditLogsModule } from './modules/auditlogs/audit-logs.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoanApplicationsModule } from './modules/loan-applications/loanapplications.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { ReportsModule } from './modules/reports/reports.module';
// import các module khác nếu có

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/loanpro'),
    UsersModule,
    CustomersModule,
    LoansModule,
    LoanApplicationsModule,
    RepaymentsModule,
    AuditLogsModule,
    AuthModule,
    ReportsModule, // ← Thêm dòng này
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Bảo vệ tất cả route mặc định
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
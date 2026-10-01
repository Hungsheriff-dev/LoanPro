import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './schemas/auditlog.schema';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [AuditLogsController],
  providers: [AuditLogsService],
  exports: [AuditLogsService], // Quan trọng: export để module khác dùng được
})
export class AuditLogsModule {}
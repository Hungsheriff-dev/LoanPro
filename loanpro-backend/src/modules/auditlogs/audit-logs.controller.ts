import { Controller, Get, Param } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  // Chỉ ADMIN và MANAGER được xem toàn bộ log
  @Roles('ADMIN', 'MANAGER')
  @Get()
  findAll() {
    return this.auditLogsService.findAll();
  }

  // Xem log theo entity (ví dụ: LoanApplication + id)
  @Roles('ADMIN', 'MANAGER')
  @Get('entity/:entity/:entityId')
  findByEntity(
    @Param('entity') entity: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditLogsService.findByEntity(entity, entityId);
  }

  // Xem log theo user
  @Roles('ADMIN', 'MANAGER')
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.auditLogsService.findByUser(userId);
  }
}
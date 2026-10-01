import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Dashboard tổng quan
  @Roles('MANAGER', 'ADMIN')
  @Get('dashboard')
  getDashboard() {
    return this.reportsService.getDashboard();
  }
}
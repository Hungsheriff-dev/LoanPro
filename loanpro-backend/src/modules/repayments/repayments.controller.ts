import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Req,
  } from '@nestjs/common';
  import { RepaymentsService } from './repayments.service';
  import { MarkAsPaidDto } from './dto/mark-as-paid.dto';
  import { Roles } from '../auth/decorators/roles.decorator';
  
  @Controller('repayments')
  export class RepaymentsController {
    constructor(private readonly repaymentsService: RepaymentsService) {}
  
    // Lấy lịch trả nợ theo khoản vay
    @Roles('CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN')
    @Get('loan/:loanId')
    findByLoan(@Param('loanId') loanId: string) {
      return this.repaymentsService.findByLoan(loanId);
    }
  
    // Lấy danh sách kỳ trả nợ quá hạn
    @Roles('CREDIT_OFFICER', 'MANAGER', 'ADMIN')
    @Get('overdue/list')
    findOverdue() {
      return this.repaymentsService.findOverdue();
    }
  
    // Xem chi tiết một kỳ trả nợ
    @Roles('CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN')
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.repaymentsService.findOne(id);
    }
  
    // Đánh dấu đã thanh toán
    @Roles('CREDIT_OFFICER', 'MANAGER', 'ADMIN')
    @Patch(':id/pay')
    markAsPaid(
      @Param('id') id: string,
      @Body() markAsPaidDto: MarkAsPaidDto,
      @Req() req,
    ) {
      return this.repaymentsService.markAsPaid(id, markAsPaidDto, req.user.userId || req.user.sub,);
    }
  }
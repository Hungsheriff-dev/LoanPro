import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
  } from '@nestjs/common';
  import { LoansService } from './loans.service';
  import { UpdateLoanDto } from './dto/update-loan.dto';
  import { Roles } from '../auth/decorators/roles.decorator';
  
  @Controller('loans')
  export class LoansController {
    constructor(private readonly loansService: LoansService) {}
  
    // Lấy danh sách tất cả khoản vay
    @Roles('CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN')
    @Get()
    findAll() {
      return this.loansService.findAll();
    }
  
    // Tìm theo mã khoản vay LN-xxxxx (đặt trước :id)
    @Roles('CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN')
    @Get('code/:loanId')
    findByLoanId(@Param('loanId') loanId: string) {
      return this.loansService.findByLoanId(loanId);
    }
  
    // Lấy danh sách khoản vay theo khách hàng
    @Roles('CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN')
    @Get('customer/:customerId')
    findByCustomer(@Param('customerId') customerId: string) {
      return this.loansService.findByCustomer(customerId);
    }
  
    // Xem chi tiết theo ID
    @Roles('CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN')
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.loansService.findOne(id);
    }
  
    // Cập nhật khoản vay (chỉ MANAGER và ADMIN)
    @Roles('MANAGER', 'ADMIN')
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
      return this.loansService.update(id, updateLoanDto);
    }
  }
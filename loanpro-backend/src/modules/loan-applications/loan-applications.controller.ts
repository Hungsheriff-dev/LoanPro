import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Request,
  } from '@nestjs/common';
  import { LoanApplicationsService } from './loan-applications.service';
  import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
  import { UpdateLoanApplicationDto } from './dto/update-loan-application.dto';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { ReviewLoanApplicationDto } from './dto/review-loan-application.dto';
  import { DisburseLoanDto } from './dto/disburse-loan.dto';
  
  @Controller('loan-applications')
  export class LoanApplicationsController {
    constructor(
      private readonly loanApplicationsService: LoanApplicationsService,
    ) {}
  
    // Lấy danh sách tất cả hồ sơ
    @Roles('CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN')
    @Get()
    findAll() {
      return this.loanApplicationsService.findAll();
    }

        // Lấy danh sách hồ sơ đang chờ phê duyệt
    @Roles('APPROVER', 'MANAGER', 'ADMIN')
    @Get('pending/list')
    getPendingApplications() {
      return this.loanApplicationsService.getPendingApplications();
    }
    
    // Tìm theo mã hồ sơ LA-xxxxx (đặt trước :id)
    @Roles('CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN')
    @Get('code/:applicationId')
    findByApplicationId(@Param('applicationId') applicationId: string) {
      return this.loanApplicationsService.findByApplicationId(applicationId);
    }
  
    // Xem chi tiết theo ID
    @Roles('CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN')
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.loanApplicationsService.findOne(id);
    }
  
    // Tạo hồ sơ vay mới (DRAFT)
    @Roles('CREDIT_OFFICER', 'MANAGER', 'ADMIN')
@Post()
create(
  @Body() createDto: CreateLoanApplicationDto,  // ← Phải có @Body()
  @Request() req,
) {
  return this.loanApplicationsService.create(createDto, req.user.userId);
}

    // Cập nhật hồ sơ (chỉ khi DRAFT)
    @Roles('CREDIT_OFFICER', 'MANAGER', 'ADMIN')
    @Patch(':id')
    update(
      @Param('id') id: string,
      @Body() updateDto: UpdateLoanApplicationDto,
      @Request() req,
    ) {
      return this.loanApplicationsService.update(id, updateDto, req.user.userId);
    }
  
    // Gửi hồ sơ để phê duyệt (DRAFT → PENDING)
    @Roles('CREDIT_OFFICER', 'MANAGER', 'ADMIN')
    @Patch(':id/submit')
    submit(@Param('id') id: string, @Request() req) {
      return this.loanApplicationsService.submit(id, req.user.userId);
    }

  // Phê duyệt / Từ chối / Yêu cầu bổ sung
  @Roles('APPROVER', 'MANAGER', 'ADMIN')
  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @Body() reviewDto: ReviewLoanApplicationDto,
    @Request() req,
  ) {
    return this.loanApplicationsService.review(
      id,
      reviewDto,
      req.user.userId,
      req.user.role,
    );
  }

      // Giải ngân hồ sơ (chỉ khi APPROVED)
    @Roles('MANAGER', 'ADMIN')
    @Patch(':id/disburse')
    disburse(
      @Param('id') id: string,
      @Body() disburseDto: DisburseLoanDto,
      @Request() req,
    ) {
      return this.loanApplicationsService.disburse(
        id,
        disburseDto,
        req.user.userId,
      );
    }
  
    // Xóa hồ sơ (chỉ khi DRAFT)
    @Roles('CREDIT_OFFICER', 'ADMIN')
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.loanApplicationsService.remove(id);
    }
  }
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import {
    LoanApplication,
    LoanApplicationDocument,
  } from './schemas/loanapplication.schema';
  import {
    RepaymentSchedule,
    RepaymentScheduleDocument,
  } from '../repayments/schemas/repayment.schema';
  import { DisburseLoanDto } from './dto/disburse-loan.dto';
  import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
  import { UpdateLoanApplicationDto } from './dto/update-loan-application.dto';
  import { CustomersService } from '../customers/customers.service';
  import { ReviewLoanApplicationDto } from './dto/review-loan-application.dto';
  import { Loan, LoanDocument } from '../loans/schemas/loan.schema';
  import { AuditLogsService } from '../auditlogs/audit-logs.service';
  
  @Injectable()
  export class LoanApplicationsService {
    constructor(
      @InjectModel(LoanApplication.name)
      private loanApplicationModel: Model<LoanApplicationDocument>,
      @InjectModel(Loan.name)
      private loanModel: Model<LoanDocument>,
      @InjectModel(RepaymentSchedule.name)
      private repaymentModel: Model<RepaymentScheduleDocument>,
      private customersService: CustomersService,
      private auditLogsService: AuditLogsService,
    ) {}
  
    // Tạo mã hồ sơ vay tự động: LA-00001, LA-00002...
    private async generateApplicationId(): Promise<string> {
      const lastApplication = await this.loanApplicationModel
        .findOne()
        .sort({ createdAt: -1 })  // sắp xếp hồ sơ mới nhất lên đầu
        .exec();
  
      let nextNumber = 1;
      if (lastApplication && lastApplication.applicationId) {
        const lastNumber = parseInt(
          lastApplication.applicationId.split('-')[1],
          10,
        );
        nextNumber = lastNumber + 1;
      }
  
      return `LA-${nextNumber.toString().padStart(5, '0')}`;
    }
  
    async create(createDto: CreateLoanApplicationDto, userId: string) {
      // Kiểm tra khách hàng có tồn tại không
      await this.customersService.findOne(createDto.customerId);
  
      const applicationId = await this.generateApplicationId(); //tạo mã hồ sơ vay
  
      const application = new this.loanApplicationModel({
        applicationId,
        customer: createDto.customerId,
        loanType: createDto.loanType,
        amount: createDto.amount,
        tenure: createDto.tenure,
        interestRate: createDto.interestRate,
        purpose: createDto.purpose,
        status: 'DRAFT',
        currentStep: 1,
        submittedBy: userId,
      });
      const savedApplication = await application.save();

      // Audit Log
      await this.auditLogsService.create({
        user: userId,
        action: 'CREATE_LOAN_APPLICATION',
        entity: 'LoanApplication',
        entityId: savedApplication._id.toString(),
        description: `Tạo hồ sơ vay ${savedApplication.applicationId}`,
        newValue: savedApplication,
      });

      return savedApplication;
    }
  
    async findAll() {
      return this.loanApplicationModel
        .find()
        .populate('customer', 'fullName customerId phone identityNumber')
        .populate('submittedBy', 'fullName username')
        .sort({ createdAt: -1 })
        .exec();
    }
  
    async findOne(id: string) {
      const application = await this.loanApplicationModel
        .findById(id)
        .populate('customer', 'fullName customerId phone identityNumber email') //lấy thông tin khách hàng (có thêm email)
        .populate('submittedBy', 'fullName username') //lấy thông tin người tạo hồ sơ
        .populate('reviewedBy.user', 'fullName username role') //lấy thông tin người duyệt hồ sơ
        .exec();
  
      if (!application) {
        throw new NotFoundException('Không tìm thấy hồ sơ vay');
      }
  
      return application;
    }
  
    async findByApplicationId(applicationId: string) { //tìm hồ sơ theo mã hồ sơ vay
      const application = await this.loanApplicationModel
        .findOne({ applicationId })
        .populate('customer', 'fullName customerId phone identityNumber') 
        .populate('submittedBy', 'fullName username') 
        .exec();
  
      if (!application) {
        throw new NotFoundException('Không tìm thấy hồ sơ vay');
      }
  
      return application;
    }
  
    async update(id: string, updateDto: UpdateLoanApplicationDto, userId: string) {
      const application = await this.loanApplicationModel.findById(id);
  
      if (!application) {
        throw new NotFoundException('Không tìm thấy hồ sơ vay');
      }
  
      // Chỉ cho phép sửa khi đang ở trạng thái DRAFT
      if (application.status !== 'DRAFT') {
        throw new BadRequestException(
          'Chỉ được chỉnh sửa hồ sơ khi đang ở trạng thái DRAFT',
        );
      }
  
      Object.assign(application, updateDto);
      return application.save();
    }
  
    async submit(id: string, userId: string) {
      const application = await this.loanApplicationModel.findById(id);
  
      if (!application) {
        throw new NotFoundException('Không tìm thấy hồ sơ vay');
      }
  
      if (application.status !== 'DRAFT') {
        throw new BadRequestException('Hồ sơ này đã được gửi trước đó');
      }
  
      application.status = 'PENDING';
      application.submittedAt = new Date();
      application.submittedBy = userId as any;
      application.currentStep = 1;

      const savedApplication = await application.save();
  
      await this.auditLogsService.create({
        user: userId,
        action: 'SUBMIT_LOAN_APPLICATION',
        entity: 'LoanApplication',
        entityId: application._id.toString(),
        description: `Gửi hồ sơ vay ${application.applicationId} để phê duyệt`,
        newValue: { status: 'PENDING' },
      });

      return savedApplication;
    }
  
    async remove(id: string) {
      const application = await this.loanApplicationModel.findById(id);
  
      if (!application) {
        throw new NotFoundException('Không tìm thấy hồ sơ vay');
      }
  
      if (application.status !== 'DRAFT') {
        throw new BadRequestException('Chỉ được xóa hồ sơ ở trạng thái DRAFT');
      }
  
      await application.deleteOne();
      return { message: 'Xóa hồ sơ vay thành công' };
    }

      // Lấy danh sách hồ sơ đang chờ phê duyệt
  async getPendingApplications() {
    return this.loanApplicationModel
      .find({ status: { $in: ['PENDING', 'REVIEWING'] } })
      .populate('customer', 'fullName customerId phone identityNumber')
      .populate('submittedBy', 'fullName username')
      .sort({ submittedAt: 1 }) //cũ nhất lên trước
      .exec();
  }

  // Phê duyệt / Từ chối / Yêu cầu bổ sung
  async review(
    id: string,
    reviewDto: ReviewLoanApplicationDto,
    userId: string,
    userRole: string,
  ) {
    const application = await this.loanApplicationModel.findById(id);

    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ vay');
    }

    if (!['PENDING', 'REVIEWING'].includes(application.status)) {
      throw new BadRequestException(
        'Chỉ được phê duyệt hồ sơ đang ở trạng thái PENDING hoặc REVIEWING',
      );
    }

    // Ghi lịch sử phê duyệt
    application.reviewedBy.push({
      user: userId as any,
      action: reviewDto.action,
      comment: reviewDto.comment,
      date: new Date(),
    });

    // Xử lý theo action
    if (reviewDto.action === 'APPROVE') {
      if (userRole === 'APPROVER') {
        // Approver phê duyệt → chuyển sang REVIEWING, chờ Manager
        application.status = 'REVIEWING';
        application.currentStep = 2; //hồ sơ đang ở bước 2 của quy trình xử lý
      } else if (userRole === 'MANAGER' || userRole === 'ADMIN') {
        // Manager / Admin phê duyệt cuối → APPROVED
        application.status = 'APPROVED';
        application.currentStep = 3;
      }
    } else if (reviewDto.action === 'REJECT') {
      application.status = 'REJECTED';
    } else if (reviewDto.action === 'REQUEST_MORE_INFO') {
      application.status = 'DRAFT'; // Trả về cho Credit Officer chỉnh sửa
      application.currentStep = 1;
    }
          // currentStep = 1
          // → Bước 1: Credit Officer xử lý hồ sơ

          // currentStep = 2
          // → Bước 2: Approver kiểm tra

          // currentStep = 3
          // → Bước 3: Manager/Admin phê duyệt cuối

          const savedApplication = await application.save();
          
          await this.auditLogsService.create({
            user: userId,
            action: `REVIEW_${reviewDto.action}`,
            entity: 'LoanApplication',
            entityId: application._id.toString(),
            description: `${reviewDto.action} hồ sơ ${application.applicationId}`,
            newValue: {
              status: application.status,
              comment: reviewDto.comment,
            },
          });

          return savedApplication;
  }

  async disburse(id: string, disburseDto: DisburseLoanDto, userId: string) {
    const application = await this.loanApplicationModel.findById(id);

    if (!application) {
      throw new NotFoundException('Không tìm thấy hồ sơ vay');
    }

    if (application.status !== 'APPROVED') {
      throw new BadRequestException(
        'Chỉ được giải ngân hồ sơ đang ở trạng thái APPROVED',
      );
    }

    const disbursedAmount =
      disburseDto.disbursedAmount || application.amount; //Nếu có nhập số tiền giải ngân → dùng số đó.
                                                        //Nếu không → lấy toàn bộ số tiền trong hồ sơ vay.

    // 1. Tạo mã khoản vay
    const loanId = await this.generateLoanId();

    // 2. Tạo khoản vay (Loan)
    const loan = new this.loanModel({
      loanId,
      application: application._id,
      customer: application.customer,
      principalAmount: application.amount, // số tiền gốc
      disbursedAmount,  //số tiển đã chi trả
      disbursedDate: new Date(), // ngày giải ngân
      tenure: application.tenure, //nhiệm kỳ
      interestRate: application.interestRate || 12, // mặc định 12% nếu không có
      status: 'ACTIVE',
      totalRepaid: 0, //tổng số tiền đã trả
      remainingBalance: disbursedAmount, //số dư còn lại
    });

    await loan.save();

    // 3. Tạo lịch trả nợ
    await this.generateRepaymentSchedule(loan);

    // 4. Cập nhật trạng thái hồ sơ
    application.status = 'DISBURSED';
    await application.save();

    await this.auditLogsService.create({
      user: userId,
      action: 'DISBURSE_LOAN',
      entity: 'LoanApplication',
      entityId: application._id.toString(),
      description: `Giải ngân hồ sơ ${application.applicationId} → tạo khoản vay ${loan.loanId}`,
      newValue: {
        loanId: loan.loanId,
        disbursedAmount: loan.disbursedAmount,
      },
    });

    return {
      message: 'Giải ngân thành công',
      loan,
    };
  }

  // Tạo mã khoản vay: LN-00001
  private async generateLoanId(): Promise<string> {
    const lastLoan = await this.loanModel
      .findOne()
      .sort({ createdAt: -1 })
      .exec();

    let nextNumber = 1;
    if (lastLoan && lastLoan.loanId) {
      const lastNumber = parseInt(lastLoan.loanId.split('-')[1], 10);
      nextNumber = lastNumber + 1;
    }

    return `LN-${nextNumber.toString().padStart(5, '0')}`;
  }

  // Tính toán và tạo lịch trả nợ (phương pháp đều gốc)
  private async generateRepaymentSchedule(loan: LoanDocument) {
    const monthlyInterestRate = (loan.interestRate || 12) / 100 / 12;
    const tenure = loan.tenure;
    const principal = loan.disbursedAmount;

    // Công thức trả đều gốc + lãi (số tiền phải trả mỗi tháng)
    const monthlyPayment =
      (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenure)) /
      (Math.pow(1 + monthlyInterestRate, tenure) - 1);

    let remainingPrincipal = principal;

    const schedules: Partial<RepaymentScheduleDocument>[] = []; //lặp qua từng tháng để tạo lịch trả nợ
    for (let i = 1; i <= tenure; i++) {
      const interest = remainingPrincipal * monthlyInterestRate; //lãi suất cố định = số vốn gốc còn lại * lãi suất hàng tháng
      const principalPortion = monthlyPayment - interest; //Phần vốn gốc = Khoản thanh toán hàng tháng - lãi suất;
      remainingPrincipal -= principalPortion;

      const dueDate = new Date(loan.disbursedDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedules.push({
        loan: loan._id,
        installmentNumber: i,
        dueDate,
        principal: Math.round(principalPortion),
        interest: Math.round(interest),
        totalPayment: Math.round(monthlyPayment),
        status: 'PENDING',
      });
    }

    await this.repaymentModel.insertMany(schedules as any);
  }
  }
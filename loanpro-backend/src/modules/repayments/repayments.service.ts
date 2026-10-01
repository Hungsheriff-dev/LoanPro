import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model, Types } from 'mongoose';
  import {
    RepaymentSchedule,
    RepaymentScheduleDocument,
  } from './schemas/repayment.schema';
  import { MarkAsPaidDto } from './dto/mark-as-paid.dto';
  import { Loan, LoanDocument } from '../loans/schemas/loan.schema';
import { AuditLogsService } from '../auditlogs/audit-logs.service';
  
  @Injectable()
  export class RepaymentsService {
    constructor(
      @InjectModel(RepaymentSchedule.name)
      private repaymentModel: Model<RepaymentScheduleDocument>,
      @InjectModel(Loan.name)
      private loanModel: Model<LoanDocument>,
      private auditLogsService: AuditLogsService,
    ) {}
  
    // Lấy lịch trả nợ theo khoản vay
    async findByLoan(loanId: string) {
      const schedules = await this.repaymentModel
        .find({ loan: new Types.ObjectId(loanId) })  // ← ép kiểu ObjectId
        .sort({ installmentNumber: 1 })
        .exec();
    
      if (!schedules || schedules.length === 0) {
        throw new NotFoundException('Không tìm thấy lịch trả nợ của khoản vay này');
      }
    
      return schedules;
    }
  
    // Xem chi tiết một kỳ trả nợ
    async findOne(id: string) {
      const schedule = await this.repaymentModel
        .findById(id)
        .populate('loan', 'loanId principalAmount status')
        .exec();
  
      if (!schedule) {
        throw new NotFoundException('Không tìm thấy kỳ trả nợ');
      }
  
      return schedule;
    }
  
    // Đánh dấu đã thanh toán
    async markAsPaid(id: string, markAsPaidDto: MarkAsPaidDto, userId: string) {
      const schedule = await this.repaymentModel.findById(id);
      if (!schedule) {
        throw new NotFoundException('Không tìm thấy kỳ trả nợ');
      }
    
      if (schedule.status === 'PAID') {
        throw new BadRequestException('Kỳ trả nợ này đã được thanh toán trước đó');
      }
    
      // ===== THÊM ĐOẠN NÀY =====
      // Kiểm tra các kỳ trước đã trả hết chưa
      const unpaidPrevious = await this.repaymentModel.findOne({
        loan: schedule.loan,
        installmentNumber: { $lt: schedule.installmentNumber },
        status: { $ne: 'PAID' },
      });
    
      if (unpaidPrevious) {
        throw new BadRequestException(
          `Vui lòng thanh toán kỳ ${unpaidPrevious.installmentNumber} trước`,
        );
      }
      // ========================
      
      //ghi nhận kỳ trả nợ đã thanh toán
      const paidAmount = markAsPaidDto.paidAmount || schedule.totalPayment; //paidAmount: tiền kh phải trả kỳ này
      //totalPayment: tổng số tiền kh phải trả cho kỳ đó
      const paidDate = markAsPaidDto.paidDate //ngày thanh toán
        ? new Date(markAsPaidDto.paidDate) //paidDate: ngày người dùng nhập, ko thì dùng ngày hiện tại
        : new Date();
    
      schedule.status = 'PAID'; //đổi kỳ nợ thành paid
      schedule.paidAmount = paidAmount; //cập nhập tiền đã trả
      schedule.paidDate = paidDate; //cập nhập ngày đã trả
    
      await schedule.save();
    
      await this.updateLoanBalance(schedule.loan.toString(), paidAmount);
    
      await this.auditLogsService.create({
        user: userId,
        action: 'MARK_AS_PAID',
        entity: 'RepaymentSchedule',
        entityId: schedule._id.toString(),
        description: `Thanh toán kỳ ${schedule.installmentNumber} của khoản vay`,
        newValue: {
          paidAmount: schedule.paidAmount,
          paidDate: schedule.paidDate,
          status: 'PAID',
        },
      });

      return schedule;
    }
  
    // Cập nhật số dư khoản vay
    private async updateLoanBalance(loanId: string, paidAmount: number) {
      const loan = await this.loanModel.findById(loanId);
      if (!loan) return;
  
      loan.totalRepaid = (loan.totalRepaid || 0) + paidAmount;
      loan.remainingBalance = Math.max(
        0,
        (loan.remainingBalance || 0) - paidAmount,
      );
  
      // Nếu đã trả hết thì chuyển sang COMPLETED
      if (loan.remainingBalance <= 0) {
        loan.status = 'COMPLETED';
        loan.remainingBalance = 0;
      }
  
      await loan.save();
    }
  
    // Lấy danh sách kỳ trả nợ quá hạn
    async findOverdue() {
      const today = new Date();
      return this.repaymentModel
        .find({
          status: 'PENDING',
          dueDate: { $lt: today },
        })
        .populate('loan', 'loanId customer')
        .sort({ dueDate: 1 })
        .exec();
    }
  }
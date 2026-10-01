import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import {
  LoanApplication,
  LoanApplicationDocument,
} from '../loan-applications/schemas/loanapplication.schema';
import { Loan, LoanDocument } from '../loans/schemas/loan.schema';
import {
  RepaymentSchedule,
  RepaymentScheduleDocument,
} from '../repayments/schemas/repayment.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDocument>,
    @InjectModel(LoanApplication.name)
    private loanApplicationModel: Model<LoanApplicationDocument>,
    @InjectModel(Loan.name)
    private loanModel: Model<LoanDocument>,
    @InjectModel(RepaymentSchedule.name)
    private repaymentModel: Model<RepaymentScheduleDocument>,
  ) {}

  async getDashboard() {
    const today = new Date(); //lấy ngày hiện tại để kiểm tra kỳ nợ

    const [
      totalCustomers,
      totalApplications,
      applicationsByStatus,
      totalLoans,
      activeLoans,
      disbursedStats,
      repaidStats,
      overdueCount,
    ] = await Promise.all([
      // Tổng khách hàng
      this.customerModel.countDocuments(),

      // Tổng hồ sơ vay
      this.loanApplicationModel.countDocuments(),

      // Hồ sơ theo trạng thái
      this.loanApplicationModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Tổng khoản vay
      this.loanModel.countDocuments(),

      // Khoản vay đang active
      this.loanModel.countDocuments({ status: 'ACTIVE' }),

      // Tổng tiền đã giải ngân
      this.loanModel.aggregate([
        {
          $group: {
            _id: null,
            totalDisbursed: { $sum: '$disbursedAmount' },
            totalRemaining: { $sum: '$remainingBalance' },
          },
        },
      ]),

      // Tổng tiền đã thu
      this.loanModel.aggregate([
        {
          $group: {
            _id: null,
            totalRepaid: { $sum: '$totalRepaid' },
          },
        },
      ]),

      // Số kỳ trả nợ quá hạn
      this.repaymentModel.countDocuments({
        status: 'PENDING',
        dueDate: { $lt: today },
      }),
    ]);

    // Chuyển applicationsByStatus thành object dễ dùng
    const statusMap: Record<string, number> = {};
    applicationsByStatus.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    return {
      customers: {
        total: totalCustomers,
      },
      applications: {
        total: totalApplications,
        byStatus: {
          DRAFT: statusMap['DRAFT'] || 0,
          PENDING: statusMap['PENDING'] || 0,
          REVIEWING: statusMap['REVIEWING'] || 0,
          APPROVED: statusMap['APPROVED'] || 0,
          REJECTED: statusMap['REJECTED'] || 0,
          DISBURSED: statusMap['DISBURSED'] || 0,
        },
      },
      loans: {
        total: totalLoans,
        active: activeLoans,
        totalDisbursed: disbursedStats[0]?.totalDisbursed || 0,
        totalRemaining: disbursedStats[0]?.totalRemaining || 0,
        totalRepaid: repaidStats[0]?.totalRepaid || 0,
      },
      repayments: {
        overdueCount,
      },
    };
  }
}
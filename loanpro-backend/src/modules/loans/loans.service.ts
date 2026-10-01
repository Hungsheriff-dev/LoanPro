import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Loan, LoanDocument } from './schemas/loan.schema';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoansService {
  constructor(
    @InjectModel(Loan.name) private loanModel: Model<LoanDocument>,
  ) {}

  async findAll() {
    return this.loanModel
      .find()
      .populate('customer', 'fullName customerId phone identityNumber')
      .populate('application', 'applicationId loanType amount')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const loan = await this.loanModel
      .findById(id)
      .populate('customer', 'fullName customerId phone identityNumber email')
      .populate('application', 'applicationId loanType amount purpose')
      .exec();

    if (!loan) {
      throw new NotFoundException('Không tìm thấy khoản vay');
    }

    return loan;
  }

  async findByLoanId(loanId: string) {
    const loan = await this.loanModel
      .findOne({ loanId })
      .populate('customer', 'fullName customerId phone')
      .populate('application', 'applicationId')
      .exec();

    if (!loan) {
      throw new NotFoundException('Không tìm thấy khoản vay');
    }

    return loan;
  }

  async findByCustomer(customerId: string) {
    return this.loanModel
      .find({ customer: customerId })
      .populate('application', 'applicationId loanType')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateLoanDto: UpdateLoanDto) {
    const loan = await this.loanModel
      .findByIdAndUpdate(id, updateLoanDto, { new: true })
      .exec();

    if (!loan) {
      throw new NotFoundException('Không tìm thấy khoản vay');
    }

    return loan;
  }
}
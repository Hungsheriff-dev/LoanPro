import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuditLogsService } from '../auditlogs/audit-logs.service'; // ← thêm

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private readonly auditLogsService: AuditLogsService, // ← thêm
  ) {}

  private async generateCustomerId(): Promise<string> {
    const lastCustomer = await this.customerModel
      .findOne()
      .sort({ createdAt: -1 })
      .exec();

    let nextNumber = 1;
    if (lastCustomer && lastCustomer.customerId) {
      const lastNumber = parseInt(lastCustomer.customerId.split('-')[1], 10);
      nextNumber = lastNumber + 1;
    }

    return `CUS-${nextNumber.toString().padStart(5, '0')}`;
  }

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    // Kiểm tra CMND/CCCD đã tồn tại chưa
    const existing = await this.customerModel.findOne({
      identityNumber: createCustomerDto.identityNumber,
    });

    if (existing) {
      throw new ConflictException('Số CMND/CCCD đã tồn tại');
    }

    const customerId = await this.generateCustomerId();

    const customer = new this.customerModel({
      ...createCustomerDto,
      customerId,
      createdBy: userId,
    });

    const savedCustomer = await customer.save();

    // ===== Ghi Audit Log =====
    await this.auditLogsService.create({
      user: userId,
      action: 'CREATE',
      entity: 'Customer',
      entityId: savedCustomer._id.toString(),
      description: `Tạo khách hàng ${savedCustomer.fullName} (${savedCustomer.customerId})`,
      newValue: {
        customerId: savedCustomer.customerId,
        fullName: savedCustomer.fullName,
        identityNumber: savedCustomer.identityNumber,
        phone: savedCustomer.phone,
      },
    });

    return customer.save();
  }

  async findAll() {
    return this.customerModel
      .find()
      .populate('createdBy', 'fullName username')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const customer = await this.customerModel
      .findById(id)
      .populate('createdBy', 'fullName username') //popolate: lấy thêm thông tin của người đó
      .exec();

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    return customer;
  }

  async findByCustomerId(customerId: string) {
    const customer = await this.customerModel
      .findOne({ customerId })
      .populate('createdBy', 'fullName username')
      .exec();

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.customerModel
      .findByIdAndUpdate(id, updateCustomerDto, { new: true })
      .exec();

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    return customer;
  }

  async remove(id: string) {
    const customer = await this.customerModel.findByIdAndDelete(id).exec();

    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    return { message: 'Xóa khách hàng thành công' };
  }
}
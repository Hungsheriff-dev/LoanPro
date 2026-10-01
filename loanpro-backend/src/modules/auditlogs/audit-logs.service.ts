import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/auditlog.schema';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async create(data: {
    user: string;
    action: string;
    entity: string;
    entityId?: string;
    description?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
  }) {
    const log = new this.auditLogModel(data);
    return log.save();
  }

  async findAll() {
    return this.auditLogModel
      .find()
      .populate('user', 'fullName username role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByEntity(entity: string, entityId: string) {
    return this.auditLogModel
      .find({ entity, entityId })
      .populate('user', 'fullName username role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string) {
    return this.auditLogModel
      .find({ user: userId })
      .populate('user', 'fullName username role')
      .sort({ createdAt: -1 })
      .exec();
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './entities/audit.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name)
    private auditModel: Model<AuditLogDocument>,
  ) {}

  async create(data: Partial<AuditLog>) {
    const log = new this.auditModel(data);
    return await log.save();
  }

  async findAll() {
    return this.auditModel.find().sort({ createdAt: -1 }).limit(500);
  }

  async findOne(id: string) {
    const log = await this.auditModel.findById(id);
    if (!log) throw new NotFoundException('Audit log not found');
    return log;
  }

  async remove(id: string) {
    const deleted = await this.auditModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Audit log not found');
    return { message: 'Deleted successfully' };
  }

  async getStats() {
    const [total, byAction, byEntity, byUser, last24h, last7days] =
      await Promise.all([
        // total
        this.auditModel.countDocuments(),

        // par action
        this.auditModel.aggregate([
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // par module (entityType)
        this.auditModel.aggregate([
          { $group: { _id: '$entityType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),

        // top utilisateurs actifs
        this.auditModel.aggregate([
          { $group: { _id: '$userEmail', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),

        // activité dernières 24h (par heure)
        this.auditModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: { $hour: '$createdAt' },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id': 1 } },
        ]),

        // activité 7 derniers jours (par jour)
        this.auditModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id': 1 } },
        ]),
      ]);

    return { total, byAction, byEntity, byUser, last24h, last7days };
  }
}

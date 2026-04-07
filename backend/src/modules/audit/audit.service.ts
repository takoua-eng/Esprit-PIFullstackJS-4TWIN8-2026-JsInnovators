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
    const since7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const CRITICAL_ACTIONS = [
      'DELETE', 'ARCHIVE', 'DEACTIVATE',
      'RESET_PASSWORD', 'FORGOT_PASSWORD',
    ];

    const [total, byAction, byEntity, byUser, last24h, last7days,
           criticalChanges, loginCount, patientModifications, alertsGenerated] =
      await Promise.all([
        this.auditModel.countDocuments(),

        this.auditModel.aggregate([
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        this.auditModel.aggregate([
          { $group: { _id: '$entityType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),

        this.auditModel.aggregate([
          { $group: { _id: '$userEmail', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),

        this.auditModel.aggregate([
          { $match: { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
          { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
          { $sort: { '_id': 1 } },
        ]),

        this.auditModel.aggregate([
          { $match: { createdAt: { $gte: since7days } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { '_id': 1 } },
        ]),

        // ── Critical changes (last 7 days) ──────────────────────
        this.auditModel.countDocuments({
          createdAt: { $gte: since7days },
          $or: [
            { action: { $in: CRITICAL_ACTIONS } },
            { action: 'UPDATE', entityType: { $regex: /ROLE/i } },
          ],
        }),

        // ── Login count (last 7 days) ────────────────────────────
        this.auditModel.countDocuments({
          createdAt: { $gte: since7days },
          action: 'LOGIN',
        }),

        // ── Patient modifications (last 7 days) ──────────────────
        this.auditModel.countDocuments({
          createdAt: { $gte: since7days },
          action: { $in: ['CREATE', 'UPDATE'] },
          entityType: { $regex: /PATIENT/i },
        }),

        // ── Alerts generated (last 7 days) ───────────────────────
        this.auditModel.countDocuments({
          createdAt: { $gte: since7days },
          entityType: { $regex: /ALERT/i },
        }),
      ]);

    return {
      total, byAction, byEntity, byUser, last24h, last7days,
      // ── Pre-computed stats for dashboard ──
      criticalChanges,
      loginCount,
      patientModifications,
      alertsGenerated,
      totalLast7days: (last7days as any[]).reduce((s: number, d: any) => s + d.count, 0),
    };
  }
}

import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Alert, AlertDocument } from './alert.schema';
import { User, UserDocument } from '../users/user.schema';
import { Role, RoleDocument } from '../roles/role.schema';

export type AlertListItem = {
  _id: string;
  patientId: string;
  patientName: string;
  type: string;
  severity: string;
  parameter?: string;
  value?: number;
  threshold?: number;
  message: string;
  status: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string | null;
  createdAt?: Date;
};

@Injectable()
export class AlertsService implements OnModuleInit {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  /** ObjectIds of users whose role is Patient — clinical alerts are only for patients. */
  private async getPatientUserObjectIds(): Promise<Types.ObjectId[]> {
    const patientRole = await this.roleModel.findOne({ name: 'Patient' }).exec();
    if (!patientRole) return [];
    const users = await this.userModel
      .find({ role: patientRole._id })
      .select('_id')
      .lean()
      .exec();
    return users.map((u) => u._id as Types.ObjectId);
  }

  async onModuleInit() {
    const count = await this.alertModel.countDocuments().exec();
    if (count > 0) return;

    const patientRole = await this.roleModel.findOne({ name: 'Patient' }).exec();
    if (!patientRole) {
      this.logger.warn(
        'Demo alerts not seeded: no Role named "Patient" found in the database.',
      );
      return;
    }

    const patientUser = await this.userModel
      .findOne({ role: patientRole._id })
      .exec();
    if (!patientUser) {
      this.logger.warn(
        'Demo alerts not seeded: no user with role Patient. Create a patient user first.',
      );
      return;
    }

    const patientId = patientUser._id;
    this.logger.log(
      `Seeding demo alerts for patient: ${patientUser.firstName} ${patientUser.lastName}`,
    );

    await this.alertModel.insertMany([
      {
        patientId,
        type: 'vital',
        severity: 'high',
        parameter: 'heartRate',
        value: 118,
        threshold: 100,
        message: 'Heart rate above threshold',
        status: 'open',
      },
      {
        patientId,
        type: 'vital',
        severity: 'medium',
        parameter: 'bloodPressure',
        value: 150,
        threshold: 140,
        message: 'Blood pressure elevated (systolic)',
        status: 'open',
      },
      {
        patientId,
        type: 'symptom',
        severity: 'low',
        parameter: 'pain',
        message: 'Patient reported increased pain (level 6)',
        status: 'acknowledged',
        acknowledgedAt: new Date(),
      },
    ]);
  }

  private toListItem(doc: AlertDocument & { patientId?: unknown }): AlertListItem {
    const p = doc.patientId as unknown as {
      firstName?: string;
      lastName?: string;
      _id?: Types.ObjectId;
    };
    let patientName = '—';
    if (p && typeof p === 'object' && 'firstName' in p) {
      patientName = [p.firstName, p.lastName].filter(Boolean).join(' ') || '—';
    }

    return {
      _id: doc._id.toString(),
      patientId:
        doc.patientId instanceof Types.ObjectId
          ? doc.patientId.toString()
          : String(doc.patientId),
      patientName,
      type: doc.type,
      severity: doc.severity,
      parameter: doc.parameter,
      value: doc.value,
      threshold: doc.threshold,
      message: doc.message,
      status: doc.status,
      acknowledgedBy: doc.acknowledgedBy?.toString(),
      acknowledgedAt: doc.acknowledgedAt
        ? doc.acknowledgedAt.toISOString()
        : null,
      createdAt: doc['createdAt'] as Date | undefined,
    };
  }

  async findAll(): Promise<AlertListItem[]> {
    const patientIds = await this.getPatientUserObjectIds();
    if (patientIds.length === 0) return [];

    const docs = await this.alertModel
      .find({ patientId: { $in: patientIds } })
      .sort({ createdAt: -1 })
      .populate('patientId', 'firstName lastName')
      .exec();
    return docs.map((d) => this.toListItem(d as AlertDocument));
  }

  async findOpenCount(): Promise<number> {
    const patientIds = await this.getPatientUserObjectIds();
    if (patientIds.length === 0) return 0;

    return this.alertModel
      .countDocuments({
        status: 'open',
        patientId: { $in: patientIds },
      })
      .exec();
  }

  async acknowledge(
    id: string,
    nurseUserId?: string,
  ): Promise<AlertListItem> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Alert ${id} not found`);
    }

    const patientIds = await this.getPatientUserObjectIds();
    if (patientIds.length === 0) {
      throw new NotFoundException(`Alert ${id} not found`);
    }

    const update: Record<string, unknown> = {
      status: 'acknowledged',
      acknowledgedAt: new Date(),
    };
    if (nurseUserId && Types.ObjectId.isValid(nurseUserId)) {
      update['acknowledgedBy'] = new Types.ObjectId(nurseUserId);
    }

    const doc = await this.alertModel
      .findOneAndUpdate(
        { _id: id, patientId: { $in: patientIds } },
        update,
        { new: true },
      )
      .populate('patientId', 'firstName lastName')
      .exec();

    if (!doc) throw new NotFoundException(`Alert ${id} not found`);
    return this.toListItem(doc as AlertDocument);
  }
}

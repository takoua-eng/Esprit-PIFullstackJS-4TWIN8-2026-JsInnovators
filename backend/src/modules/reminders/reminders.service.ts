import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reminder, ReminderDocument } from './reminder.schema';
import { User, UserDocument } from '../users/users.schema';
import { Role, RoleDocument } from '../roles/role.schema';

export type ReminderListItem = {
  _id: string;
  patientId: string;
  patientName: string;
  type: string;
  message: string;
  status: string;
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdAt?: Date;
};

@Injectable()
export class RemindersService implements OnModuleInit {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectModel(Reminder.name) private reminderModel: Model<ReminderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  /** ObjectIds of users whose role is Patient — alerts/reminders apply only to them. */
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
    const count = await this.reminderModel.countDocuments().exec();
    if (count > 0) return;

    const patientRole = await this.roleModel.findOne({ name: 'Patient' }).exec();
    if (!patientRole) {
      this.logger.warn(
        'Demo reminders not seeded: no Role named "Patient" in the database.',
      );
      return;
    }

    const patientUser = await this.userModel
      .findOne({ role: patientRole._id })
      .exec();
    if (!patientUser) {
      this.logger.warn(
        'Demo reminders not seeded: no user with role Patient. Create a patient user first.',
      );
      return;
    }

    const nurseRole = await this.roleModel.findOne({ name: 'Nurse' }).exec();
    const nurseUser = nurseRole
      ? await this.userModel.findOne({ role: nurseRole._id }).exec()
      : null;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await this.reminderModel.insertMany([
      {
        patientId: patientUser._id,
        sentBy: nurseUser?._id,
        type: 'questionnaire',
        message: 'Complete post-discharge questionnaire (due today)',
        status: 'pending',
        scheduledAt: now,
      },
      {
        patientId: patientUser._id,
        sentBy: nurseUser?._id,
        type: 'vitals',
        message: 'Reminder: log morning vitals (BP, HR)',
        status: 'pending',
        scheduledAt: tomorrow,
      },
      {
        patientId: patientUser._id,
        type: 'follow_up',
        message: 'Phone follow-up — initial call completed',
        status: 'completed',
        scheduledAt: new Date(now.getTime() - 86400000),
        sentAt: new Date(now.getTime() - 3600000),
      },
    ]);

    this.logger.log(
      `Seeded demo reminders for patient ${patientUser.firstName} ${patientUser.lastName}`,
    );
  }

  private toListItem(
    doc: ReminderDocument & { patientId?: unknown },
  ): ReminderListItem {
    const p = doc.patientId as unknown as {
      firstName?: string;
      lastName?: string;
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
      message: doc.message,
      status: doc.status,
      scheduledAt: doc.scheduledAt
        ? doc.scheduledAt.toISOString()
        : null,
      sentAt: doc.sentAt ? doc.sentAt.toISOString() : null,
      createdAt: doc['createdAt'] as Date | undefined,
    };
  }

  async findAll(): Promise<ReminderListItem[]> {
    const patientIds = await this.getPatientUserObjectIds();
    if (patientIds.length === 0) return [];

    const docs = await this.reminderModel
      .find({ patientId: { $in: patientIds } })
      .sort({ scheduledAt: 1, createdAt: -1 })
      .populate('patientId', 'firstName lastName')
      .exec();
    return docs.map((d) => this.toListItem(d as ReminderDocument));
  }

  async findPendingCount(): Promise<number> {
    const patientIds = await this.getPatientUserObjectIds();
    if (patientIds.length === 0) return 0;

    return this.reminderModel
      .countDocuments({
        status: 'pending',
        patientId: { $in: patientIds },
      })
      .exec();
  }

  async complete(id: string): Promise<ReminderListItem> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Reminder ${id} not found`);
    }

    const patientIds = await this.getPatientUserObjectIds();
    if (patientIds.length === 0) {
      throw new NotFoundException(`Reminder ${id} not found`);
    }

    const doc = await this.reminderModel
      .findOneAndUpdate(
        {
          _id: id,
          patientId: { $in: patientIds },
        },
        {
          status: 'completed',
          sentAt: new Date(),
        },
        { new: true },
      )
      .populate('patientId', 'firstName lastName')
      .exec();

    if (!doc) throw new NotFoundException(`Reminder ${id} not found`);
    return this.toListItem(doc as ReminderDocument);
  }
}

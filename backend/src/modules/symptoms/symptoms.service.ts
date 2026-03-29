import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Symptom, SymptomDocument } from './symptom.schema';
import { User, UserDocument } from '../users/user.schema';
import { Role, RoleDocument } from '../roles/role.schema';

export type SymptomListItem = {
  _id: string;
  patientId: string;
  patientName: string;
  reportedBy: string;
  reporterName: string;
  entrySource: string;
  symptoms: string[];
  painLevel?: number;
  description?: string;
  reportedAt: string;
  verifiedBy?: string;
  verifiedAt?: string | null;
  createdAt?: Date;
};

@Injectable()
export class SymptomsService {
  constructor(
    @InjectModel(Symptom.name) private symptomModel: Model<SymptomDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

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

  private nameOf(u: { firstName?: string; lastName?: string } | null): string {
    if (!u) return '—';
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';
  }

  private toListItem(doc: SymptomDocument & { patientId?: unknown; reportedBy?: unknown }): SymptomListItem {
    const patient = doc.patientId as unknown as { firstName?: string; lastName?: string };
    const reporter = doc.reportedBy as unknown as { firstName?: string; lastName?: string };

    return {
      _id: doc._id.toString(),
      patientId:
        doc.patientId instanceof Types.ObjectId
          ? doc.patientId.toString()
          : String(doc.patientId),
      patientName: this.nameOf(patient),
      reportedBy:
        doc.reportedBy instanceof Types.ObjectId
          ? doc.reportedBy.toString()
          : String(doc.reportedBy),
      reporterName: this.nameOf(reporter),
      entrySource: doc.entrySource,
      symptoms: doc.symptoms || [],
      painLevel: doc.painLevel,
      description: doc.description,
      reportedAt: doc.reportedAt.toISOString(),
      verifiedBy: doc.verifiedBy?.toString(),
      verifiedAt: doc.verifiedAt ? doc.verifiedAt.toISOString() : null,
      createdAt: doc['createdAt'] as Date | undefined,
    };
  }

  async findAll(patientId?: string): Promise<SymptomListItem[]> {
    const patientIds = await this.getPatientUserObjectIds();
    if (patientIds.length === 0) return [];

    const filter: Record<string, unknown> = { patientId: { $in: patientIds } };
    if (patientId && Types.ObjectId.isValid(patientId)) {
      const pid = new Types.ObjectId(patientId);
      if (patientIds.some((id) => id.equals(pid))) {
        filter['patientId'] = pid;
      }
    }

    const docs = await this.symptomModel
      .find(filter)
      .sort({ reportedAt: -1 })
      .populate('patientId', 'firstName lastName')
      .populate('reportedBy', 'firstName lastName')
      .exec();

    return docs.map((d) => this.toListItem(d as SymptomDocument));
  }

  async create(data: {
    patientId: string;
    reportedBy: string;
    entrySource?: 'patient' | 'nurse_assisted';
    symptoms?: string[];
    painLevel?: number;
    description?: string;
    reportedAt?: string;
  }): Promise<SymptomListItem> {
    const patientIds = await this.getPatientUserObjectIds();
    const pid = new Types.ObjectId(data.patientId);
    if (!patientIds.some((id) => id.equals(pid))) {
      throw new NotFoundException('Patient not found or not a Patient role user');
    }

    const doc = await this.symptomModel.create({
      patientId: pid,
      reportedBy: new Types.ObjectId(data.reportedBy),
      entrySource: data.entrySource ?? 'nurse_assisted',
      symptoms: data.symptoms ?? [],
      painLevel: data.painLevel,
      description: data.description,
      reportedAt: data.reportedAt ? new Date(data.reportedAt) : new Date(),
    });

    const populated = await this.symptomModel
      .findById(doc._id)
      .populate('patientId', 'firstName lastName')
      .populate('reportedBy', 'firstName lastName')
      .exec();

    return this.toListItem(populated as SymptomDocument);
  }

  async verify(id: string, nurseUserId: string): Promise<SymptomListItem> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(nurseUserId)) {
      throw new NotFoundException('Invalid id');
    }

    const patientIds = await this.getPatientUserObjectIds();
    const doc = await this.symptomModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          patientId: { $in: patientIds },
          verifiedAt: { $exists: false },
        },
        {
          verifiedBy: new Types.ObjectId(nurseUserId),
          verifiedAt: new Date(),
        },
        { new: true },
      )
      .populate('patientId', 'firstName lastName')
      .populate('reportedBy', 'firstName lastName')
      .exec();

    if (!doc) throw new NotFoundException(`Symptom entry ${id} not found or already verified`);
    return this.toListItem(doc as SymptomDocument);
  }
}

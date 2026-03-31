import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../users/user.schema';
import { Reminder, ReminderDocument } from './reminder.schema';

@Injectable()
export class CoordinatorService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Reminder.name) private readonly reminderModel: Model<ReminderDocument>,
    @InjectModel('VitalParameter') private readonly vitalModel: Model<any>,
    @InjectModel('Symptom') private readonly symptomModel: Model<any>,
  ) {}

  // ─── Helpers ─────────────────────────────────────────────────

  private getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // Cherche dans la collection avec patientId en String OU en ObjectId
  private async getPatientIdsWithEntryToday(
  model: Model<any>,
  dateField: string,
  patientIds: Types.ObjectId[],
): Promise<string[]> {
  const { start, end } = this.getTodayRange();

  const results = await model
    .find({
      patientId: { $in: patientIds },
      [dateField]: { $gte: start, $lte: end },
    })
    .select('patientId')
    .lean();

  return results.map((r: any) => r.patientId?.toString());
}

  // ─── DASHBOARD ───────────────────────────────────────────────

  async getDashboard(coordinatorId: string) {
    const coordinator = await this.userModel
      .findById(coordinatorId)
      .populate('assignedPatients')
      .exec();

    if (!coordinator) throw new NotFoundException('Coordinator not found');

    const patients = (coordinator.assignedPatients || []) as unknown as UserDocument[];
    const patientIds = patients.map((p) => p._id as Types.ObjectId);

    // Stats profil
    const departmentMap: Record<string, number> = {};
    let completeProfiles = 0;
    let missingEmergencyContact = 0;
    let patientsWithMedicalRecord = 0;

    for (const patient of patients) {
      const dept = patient.department || 'Unknown';
      departmentMap[dept] = (departmentMap[dept] || 0) + 1;

      const isComplete =
        !!patient.phone &&
        !!patient.address &&
        !!patient.emergencyContact &&
        !!patient.email;

      if (isComplete) completeProfiles++;
      if (!patient.emergencyContact) missingEmergencyContact++;
      if (patient.medicalRecordNumber) patientsWithMedicalRecord++;
    }

    // Stats reminders
    const { start: todayStart, end: todayEnd } = this.getTodayRange();

    const remindersSentToday = await this.reminderModel.countDocuments({
      sentBy: new Types.ObjectId(coordinatorId),
      status: 'sent',
      sentAt: { $gte: todayStart, $lte: todayEnd },
    });

    const pendingReminders = await this.reminderModel.countDocuments({
      sentBy: new Types.ObjectId(coordinatorId),
      status: 'scheduled',
    });

    // Stats compliance du jour
    const [vitalsSubmittedIds, symptomsSubmittedIds] = await Promise.all([
      this.getPatientIdsWithEntryToday(this.vitalModel, 'recordedAt', patientIds),
      this.getPatientIdsWithEntryToday(this.symptomModel, 'reportedAt', patientIds),
    ]);

    const patientIdStrings = patientIds.map((id) => id.toString());
    const missingVitalsToday = patientIdStrings.filter(
      (id) => !vitalsSubmittedIds.includes(id)
    ).length;
    const missingSymptomsToday = patientIdStrings.filter(
      (id) => !symptomsSubmittedIds.includes(id)
    ).length;

    // Patients récents
    const recentPatients = [...patients]
      .sort((a: any, b: any) =>
        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      )
      .slice(0, 5)
      .map((p) => ({
        _id: p._id,
        name: `${p.firstName} ${p.lastName}`,
        email: p.email,
        department: p.department || 'Unknown',
        status: p.emergencyContact ? 'Complete' : 'Needs attention',
      }));

    return {
      summary: {
        totalAssignedPatients: patients.length,
        departmentsCovered: Object.keys(departmentMap).length,
        completeProfiles,
        missingEmergencyContact,
        patientsWithMedicalRecord,
        remindersSentToday,
        pendingReminders,
        missingVitalsToday,
        missingSymptomsToday,
      },
      departmentDistribution: Object.entries(departmentMap).map(([label, value]) => ({
        label,
        value,
      })),
      completenessDistribution: [
        { label: 'Complete Profiles', value: completeProfiles },
        { label: 'Incomplete Profiles', value: patients.length - completeProfiles },
      ],
      recentPatients,
    };
  }

  // ─── PATIENTS ────────────────────────────────────────────────

  async getAssignedPatients(coordinatorId: string) {
    const coordinator = await this.userModel
      .findById(coordinatorId)
      .populate('assignedPatients')
      .exec();

    if (!coordinator) throw new NotFoundException('Coordinator not found');

    const patients = (coordinator.assignedPatients || []) as unknown as UserDocument[];

    return patients.map((p) => ({
      _id: p._id,
      name: `${p.firstName} ${p.lastName}`,
      email: p.email,
      phone: p.phone || '',
      department: p.department || 'Unknown',
      medicalRecordNumber: p.medicalRecordNumber || '',
      status: p.emergencyContact ? 'Complete' : 'Needs attention',
    }));
  }

  // ─── COMPLIANCE TODAY ────────────────────────────────────────

  async getComplianceToday(coordinatorId: string) {
    const coordinator = await this.userModel
      .findById(coordinatorId)
      .populate('assignedPatients')
      .exec();

    if (!coordinator) throw new NotFoundException('Coordinator not found');

    const patients = (coordinator.assignedPatients || []) as unknown as UserDocument[];
    const patientIds = patients.map((p) => p._id as Types.ObjectId);

    const [vitalsIds, symptomsIds] = await Promise.all([
      this.getPatientIdsWithEntryToday(this.vitalModel, 'recordedAt', patientIds),
      this.getPatientIdsWithEntryToday(this.symptomModel, 'reportedAt', patientIds),
    ]);

    return patients.map((p) => {
      const pid = p._id.toString();
      const vitalsSubmitted = vitalsIds.includes(pid);
      const symptomsSubmitted = symptomsIds.includes(pid);

      return {
        _id: p._id,
        name: `${p.firstName} ${p.lastName}`,
        email: p.email,
        department: p.department || 'Unknown',
        vitalsSubmitted,
        symptomsSubmitted,
        isFullyCompliant: vitalsSubmitted && symptomsSubmitted,
      };
    });
  }

  // ─── REMINDERS ───────────────────────────────────────────────

  async getReminders(coordinatorId: string) {
    return this.reminderModel
      .find({ sentBy: new Types.ObjectId(coordinatorId) })
      .populate('patientId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async createReminder(
    coordinatorId: string,
    body: { patientId: string; type: string; message: string; scheduledAt?: string },
  ) {
    const reminder = new this.reminderModel({
      patientId: new Types.ObjectId(body.patientId),
      sentBy: new Types.ObjectId(coordinatorId),
      type: body.type,
      message: body.message,
      status: 'scheduled',
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : new Date(),
    });
    return reminder.save();
  }

  async sendReminder(reminderId: string) {
    const reminder = await this.reminderModel.findById(reminderId).exec();
    if (!reminder) throw new NotFoundException('Reminder not found');
    reminder.status = 'sent';
    reminder.sentAt = new Date();
    return reminder.save();
  }

  async cancelReminder(reminderId: string) {
    const reminder = await this.reminderModel.findById(reminderId).exec();
    if (!reminder) throw new NotFoundException('Reminder not found');
    reminder.status = 'cancelled';
    return reminder.save();
  }

  async deleteReminder(reminderId: string) {
    const deleted = await this.reminderModel.findByIdAndDelete(reminderId).exec();
    if (!deleted) throw new NotFoundException('Reminder not found');
    return { message: 'Reminder deleted' };
  }
}
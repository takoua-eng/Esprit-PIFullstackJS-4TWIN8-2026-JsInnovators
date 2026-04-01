import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../users/users.schema';
import { Reminder, ReminderDocument } from './reminder.schema';

// Champs requis pour un vital complet
const REQUIRED_VITAL_FIELDS = [
  'temperature',
  'heartRate',
  'bloodPressureSystolic',
  'bloodPressureDiastolic',
  'weight',
];

// Champs requis pour symptoms complet
const REQUIRED_SYMPTOM_FIELDS = ['painLevel', 'fatigueLevel', 'symptoms'];

@Injectable()
export class CoordinatorService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Reminder.name)
    private readonly reminderModel: Model<ReminderDocument>,
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

  private checkVitalFields(doc: any): string[] {
    const missing: string[] = [];
    if (doc.temperature == null) missing.push('Temperature');
    if (doc.heartRate == null) missing.push('Heart Rate');
    // Regrouper systolic et diastolic en un seul champ
    if (doc.bloodPressureSystolic == null || doc.bloodPressureDiastolic == null)
      missing.push('Blood Pressure');
    if (doc.weight == null) missing.push('Weight');
    return missing;
  }

  private checkSymptomFields(doc: any): string[] {
    const missing: string[] = [];
    if (doc.painLevel == null) missing.push('Pain Level');
    if (doc.fatigueLevel == null) missing.push('Fatigue Level');
    if (
      !doc.symptoms ||
      (Array.isArray(doc.symptoms) && doc.symptoms.length === 0)
    )
      missing.push('Symptoms List');
    return missing;
  }

  // ─── DASHBOARD ───────────────────────────────────────────────

  async getDashboard(coordinatorId: string) {
    const coordinator = await this.userModel
      .findById(coordinatorId)
      .populate('assignedPatients')
      .exec();

    if (!coordinator) throw new NotFoundException('Coordinator not found');

    const patients = (coordinator.assignedPatients ||
      []) as unknown as UserDocument[];
    const patientIds = patients.map((p) => p._id as Types.ObjectId);

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

    // Compliance précise
    const complianceResults = await this._computeComplianceForPatients(
      patients,
      patientIds,
    );

    const missingVitalsToday = complianceResults.filter(
      (r) => !r.vitalsFullyComplete,
    ).length;

    const missingSymptomsToday = complianceResults.filter(
      (r) => !r.symptomsFullyComplete,
    ).length;

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
      departmentDistribution: Object.entries(departmentMap).map(
        ([label, value]) => ({
          label,
          value,
        }),
      ),
      recentPatients: [...patients]
        .sort(
          (a: any, b: any) =>
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime(),
        )
        .slice(0, 5)
        .map((p) => ({
          _id: p._id,
          name: `${p.firstName} ${p.lastName}`,
          email: p.email,
          department: p.department || 'Unknown',
          status: p.emergencyContact ? 'Complete' : 'Needs attention',
        })),
    };
  }

  // ─── Calcul compliance précis ─────────────────────────────────

  private async _computeComplianceForPatients(
    patients: UserDocument[],
    patientIds: Types.ObjectId[],
  ) {
    const { start, end } = this.getTodayRange();

    const [vitalDocs, symptomDocs] = await Promise.all([
      this.vitalModel
        .find({
          patientId: { $in: patientIds },
          recordedAt: { $gte: start, $lte: end },
        })
        .lean(),
      this.symptomModel
        .find({
          patientId: { $in: patientIds },
          reportedAt: { $gte: start, $lte: end },
        })
        .lean(),
    ]);

    return patients.map((p) => {
      const pid = p._id.toString();

      const vitalDoc = vitalDocs.find(
        (v: any) => v.patientId?.toString() === pid,
      );
      const symptomDoc = symptomDocs.find(
        (s: any) => s.patientId?.toString() === pid,
      );

      const missingVitalFields = vitalDoc
        ? this.checkVitalFields(vitalDoc)
        : ['Temperature', 'Heart Rate', 'Blood Pressure', 'Weight'];

      const missingSymptomFields = symptomDoc
        ? this.checkSymptomFields(symptomDoc)
        : ['Pain Level', 'Fatigue Level', 'Symptoms List'];

      const vitalsSubmitted = !!vitalDoc;
      const vitalsFullyComplete =
        vitalsSubmitted && missingVitalFields.length === 0;
      const symptomsSubmitted = !!symptomDoc;
      const symptomsFullyComplete =
        symptomsSubmitted && missingSymptomFields.length === 0;

      return {
        _id: p._id,
        name: `${p.firstName} ${p.lastName}`,
        email: p.email,
        department: p.department || 'Unknown',
        vitalsSubmitted,
        vitalsFullyComplete,
        missingVitalFields,
        symptomsSubmitted,
        symptomsFullyComplete,
        missingSymptomFields,
        isFullyCompliant: vitalsFullyComplete && symptomsFullyComplete,
      };
    });
  }

  private formatFieldName(field: string): string {
    const map: Record<string, string> = {
      temperature: 'Temperature',
      heartRate: 'Heart Rate',
      bloodPressureSystolic: 'Blood Pressure',
      bloodPressureDiastolic: 'Blood Pressure',
      weight: 'Weight',
      painLevel: 'Pain Level',
      fatigueLevel: 'Fatigue Level',
      symptoms: 'Symptoms List',
    };
    return map[field] || field;
  }

  // ─── PATIENTS ────────────────────────────────────────────────

  async getAssignedPatients(coordinatorId: string) {
    const coordinator = await this.userModel
      .findById(coordinatorId)
      .populate('assignedPatients')
      .exec();

    if (!coordinator) throw new NotFoundException('Coordinator not found');

    const patients = (coordinator.assignedPatients ||
      []) as unknown as UserDocument[];

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

  // ─── COMPLIANCE TODAY (précis) ────────────────────────────────

  async getComplianceToday(coordinatorId: string) {
    const coordinator = await this.userModel
      .findById(coordinatorId)
      .populate('assignedPatients')
      .exec();

    if (!coordinator) throw new NotFoundException('Coordinator not found');

    const patients = (coordinator.assignedPatients ||
      []) as unknown as UserDocument[];
    const patientIds = patients.map((p) => p._id as Types.ObjectId);

    return this._computeComplianceForPatients(patients, patientIds);
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
    body: {
      patientId: string;
      type: string;
      message: string;
      scheduledAt?: string;
    },
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
    const deleted = await this.reminderModel
      .findByIdAndDelete(reminderId)
      .exec();
    if (!deleted) throw new NotFoundException('Reminder not found');
    return { message: 'Reminder deleted' };
  }
}

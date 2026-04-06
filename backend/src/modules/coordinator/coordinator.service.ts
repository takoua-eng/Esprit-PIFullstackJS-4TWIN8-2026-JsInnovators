import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../users/users.schema';
import { Reminder, ReminderDocument } from './reminder.schema';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class CoordinatorService {
  private readonly logger = new Logger(CoordinatorService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Reminder.name) private readonly reminderModel: Model<ReminderDocument>,
    @InjectModel('VitalParameter') private readonly vitalModel: Model<any>,
    @InjectModel('Symptom') private readonly symptomModel: Model<any>,
    private readonly notificationService: NotificationService,
  ) {}

  // ─── Helpers ─────────────────────────────────────────────────

  private getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private getDateRange(daysBack: number) {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - daysBack);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  private checkVitalFields(doc: any): string[] {
    const missing: string[] = [];
    if (doc.temperature == null) missing.push('Temperature');
    if (doc.heartRate == null) missing.push('Heart Rate');
    if (doc.bloodPressureSystolic == null || doc.bloodPressureDiastolic == null)
      missing.push('Blood Pressure');
    if (doc.weight == null) missing.push('Weight');
    return missing;
  }

  private checkSymptomFields(doc: any): string[] {
    const missing: string[] = [];
    if (doc.painLevel == null) missing.push('Pain Level');
    if (doc.fatigueLevel == null) missing.push('Fatigue Level');
    if (!doc.symptoms || (Array.isArray(doc.symptoms) && doc.symptoms.length === 0))
      missing.push('Symptoms List');
    return missing;
  }

  private async _getMissingFields(patientId: string): Promise<{
    missingVitals: string[];
    missingSymptoms: string[];
  }> {
    const { start, end } = this.getTodayRange();
    const pid = new Types.ObjectId(patientId);

    const [vitalDoc, symptomDoc] = await Promise.all([
      this.vitalModel.findOne({ patientId: pid, recordedAt: { $gte: start, $lte: end } }).lean(),
      this.symptomModel.findOne({ patientId: pid, reportedAt: { $gte: start, $lte: end } }).lean(),
    ]);

    const missingVitals = vitalDoc
      ? this.checkVitalFields(vitalDoc)
      : ['Temperature', 'Heart Rate', 'Blood Pressure', 'Weight'];

    const missingSymptoms = symptomDoc
      ? this.checkSymptomFields(symptomDoc)
      : ['Pain Level', 'Fatigue Level', 'Symptoms List'];

    return { missingVitals, missingSymptoms };
  }

  // ─── Message personnalisé selon champs manquants ──────────────

  buildPersonalizedMessage(
    patientName: string,
    missingVitals: string[],
    missingSymptoms: string[],
  ): string {
    const firstName = patientName.split(' ')[0];
    const allVitalsMissing = missingVitals.length === 4;
    const allSymptomsMissing = missingSymptoms.length === 3;
    const noVitalsAtAll = missingVitals.length === 4;
    const noSymptomsAtAll = missingSymptoms.length === 3;

    if (noVitalsAtAll && noSymptomsAtAll) {
      return `Dear ${firstName}, you have not submitted your daily health follow-up today. Please complete both your Vital Parameters and Symptoms report as soon as possible.`;
    }

    if (noVitalsAtAll && missingSymptoms.length === 0) {
      return `Dear ${firstName}, your vital signs have not been submitted today. Please complete your Vital Parameters (Temperature, Heart Rate, Blood Pressure, Weight).`;
    }

    if (noSymptomsAtAll && missingVitals.length === 0) {
      return `Dear ${firstName}, your symptoms report has not been submitted today. Please complete your Symptoms report (Pain Level, Fatigue Level, Symptoms List).`;
    }

    const parts: string[] = [];
    if (missingVitals.length > 0) {
      parts.push(`missing vital fields: ${missingVitals.join(', ')}`);
    }
    if (missingSymptoms.length > 0) {
      parts.push(`missing symptom fields: ${missingSymptoms.join(', ')}`);
    }

    return `Dear ${firstName}, your daily follow-up is incomplete — ${parts.join(' and ')}. Please submit the missing data as soon as possible.`;
  }

  // ─── Endpoint message personnalisé (appelé par le frontend) ──

  async getPersonalizedMessage(coordinatorId: string, patientId: string) {
    const patient = await this.userModel.findById(patientId).lean();
    if (!patient) throw new NotFoundException('Patient not found');

    const patientName = `${patient.firstName} ${patient.lastName}`;
    const { missingVitals, missingSymptoms } = await this._getMissingFields(patientId);
    const message = this.buildPersonalizedMessage(patientName, missingVitals, missingSymptoms);

    return { message, missingVitals, missingSymptoms };
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

    const departmentMap: Record<string, number> = {};
    let completeProfiles = 0;
    let missingEmergencyContact = 0;
    let patientsWithMedicalRecord = 0;

    for (const patient of patients) {
      const dept = patient.department || 'Unknown';
      departmentMap[dept] = (departmentMap[dept] || 0) + 1;
      const isComplete =
        !!patient.phone && !!patient.address && !!patient.emergencyContact && !!patient.email;
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

    const complianceResults = await this._computeComplianceForPatients(patients, patientIds);
    const missingVitalsToday = complianceResults.filter((r) => !r.vitalsFullyComplete).length;
    const missingSymptomsToday = complianceResults.filter((r) => !r.symptomsFullyComplete).length;

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
      recentPatients: [...patients]
        .sort(
          (a: any, b: any) =>
            new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
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

  // ─── Compliance ───────────────────────────────────────────────

  private async _computeComplianceForPatients(
    patients: UserDocument[],
    patientIds: Types.ObjectId[],
  ) {
    const { start, end } = this.getTodayRange();

    const [vitalDocs, symptomDocs] = await Promise.all([
      this.vitalModel
        .find({ patientId: { $in: patientIds }, recordedAt: { $gte: start, $lte: end } })
        .lean(),
      this.symptomModel
        .find({ patientId: { $in: patientIds }, reportedAt: { $gte: start, $lte: end } })
        .lean(),
    ]);

    return patients.map((p) => {
      const pid = p._id.toString();
      const vitalDoc = vitalDocs.find((v: any) => v.patientId?.toString() === pid);
      const symptomDoc = symptomDocs.find((s: any) => s.patientId?.toString() === pid);

      const missingVitalFields = vitalDoc
        ? this.checkVitalFields(vitalDoc)
        : ['Temperature', 'Heart Rate', 'Blood Pressure', 'Weight'];
      const missingSymptomFields = symptomDoc
        ? this.checkSymptomFields(symptomDoc)
        : ['Pain Level', 'Fatigue Level', 'Symptoms List'];

      const vitalsSubmitted = !!vitalDoc;
      const vitalsFullyComplete = vitalsSubmitted && missingVitalFields.length === 0;
      const symptomsSubmitted = !!symptomDoc;
      const symptomsFullyComplete = symptomsSubmitted && missingSymptomFields.length === 0;

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

  async getComplianceToday(coordinatorId: string) {
    const coordinator = await this.userModel
      .findById(coordinatorId)
      .populate('assignedPatients')
      .exec();

    if (!coordinator) throw new NotFoundException('Coordinator not found');

    const patients = (coordinator.assignedPatients || []) as unknown as UserDocument[];
    const patientIds = patients.map((p) => p._id as Types.ObjectId);

    return this._computeComplianceForPatients(patients, patientIds);
  }

  // ─── PREDICTION ──────────────────────────────────────────────

  async getPrediction(coordinatorId: string) {
    const coordinator = await this.userModel
      .findById(coordinatorId)
      .populate('assignedPatients')
      .exec();

    if (!coordinator) throw new NotFoundException('Coordinator not found');

    const patients = (coordinator.assignedPatients || []) as unknown as UserDocument[];
    const patientIds = patients.map((p) => p._id as Types.ObjectId);
    const { start, end } = this.getDateRange(14);

    const [vitalHistory, symptomHistory] = await Promise.all([
      this.vitalModel
        .find({ patientId: { $in: patientIds }, recordedAt: { $gte: start, $lte: end } })
        .lean(),
      this.symptomModel
        .find({ patientId: { $in: patientIds }, reportedAt: { $gte: start, $lte: end } })
        .lean(),
    ]);

    const patientStats = patients.map((p) => {
      const pid = p._id.toString();
      const patientVitals = vitalHistory.filter((v: any) => v.patientId?.toString() === pid);
      const patientSymptoms = symptomHistory.filter(
        (s: any) => s.patientId?.toString() === pid,
      );

      const vitalDays = new Set(
        patientVitals.map((v: any) => new Date(v.recordedAt).toISOString().split('T')[0]),
      );
      const symptomDays = new Set(
        patientSymptoms.map((s: any) => new Date(s.reportedAt).toISOString().split('T')[0]),
      );

      const allDays = new Set([...vitalDays, ...symptomDays]);
      const fullComplianceDays = [...allDays].filter(
        (d) => vitalDays.has(d) && symptomDays.has(d),
      ).length;
      const complianceRate = Math.round((fullComplianceDays / 14) * 100);

      let consecutiveMissingDays = 0;
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayKey = d.toISOString().split('T')[0];
        if (!vitalDays.has(dayKey) && !symptomDays.has(dayKey)) consecutiveMissingDays++;
        else break;
      }

      const allSubmissionDates = [
        ...patientVitals.map((v: any) => new Date(v.recordedAt).getTime()),
        ...patientSymptoms.map((s: any) => new Date(s.reportedAt).getTime()),
      ];
      const lastSubmission =
        allSubmissionDates.length > 0
          ? new Date(Math.max(...allSubmissionDates)).toISOString()
          : null;

      let riskScore = 0;
      if (complianceRate < 30) riskScore += 50;
      else if (complianceRate < 60) riskScore += 30;
      else if (complianceRate < 80) riskScore += 15;
      if (consecutiveMissingDays >= 3) riskScore += 40;
      else if (consecutiveMissingDays >= 2) riskScore += 25;
      else if (consecutiveMissingDays >= 1) riskScore += 10;
      if (!lastSubmission) riskScore += 10;
      riskScore = Math.min(riskScore, 100);

      let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
      if (riskScore >= 60) riskLevel = 'HIGH';
      else if (riskScore >= 30) riskLevel = 'MEDIUM';
      else riskLevel = 'LOW';

      return {
        patientId: pid,
        name: `${p.firstName} ${p.lastName}`,
        email: p.email,
        department: p.department || 'Unknown',
        complianceRate,
        consecutiveMissingDays,
        lastSubmission,
        totalVitalSubmissions: patientVitals.length,
        totalSymptomSubmissions: patientSymptoms.length,
        riskScore,
        riskLevel,
        vitalDaysCount: vitalDays.size,
        symptomDaysCount: symptomDays.size,
      };
    });

    patientStats.sort((a, b) => b.riskScore - a.riskScore);
    return {
      generatedAt: new Date().toISOString(),
      periodDays: 14,
      patients: patientStats,
    };
  }

  // ─── REMINDERS ───────────────────────────────────────────────

  async getReminders(coordinatorId: string) {
    return this.reminderModel
      .find({ sentBy: new Types.ObjectId(coordinatorId) })
      .populate('patientId', 'firstName lastName email emergencyContact')
      .sort({ createdAt: -1 })
      .exec();
  }

  // createReminder — crée uniquement, AUCUN email ni SMS
  async createReminder(
    coordinatorId: string,
    body: {
      patientId: string;
      type: string;
      message: string;
      scheduledAt?: string;
      status?: string;
    },
  ) {
    const reminder = new this.reminderModel({
      patientId: new Types.ObjectId(body.patientId),
      sentBy: new Types.ObjectId(coordinatorId),
      type: body.type,
      message: body.message,
      status: body.status || 'scheduled',
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : new Date(),
      emailSent: false,
      smsSent: false,
      smsJobDone: false,
    });

    return reminder.save();
  }

  // sendReminder — SEULE source d'envoi email + planification SMS
  async sendReminder(reminderId: string) {
    const reminder = await this.reminderModel
      .findById(reminderId)
      .populate('patientId', 'firstName lastName email emergencyContact')
      .exec();

    if (!reminder) throw new NotFoundException('Reminder not found');

    // Éviter le double envoi
    if (reminder.emailSent) {
      this.logger.warn(`Email already sent for reminder ${reminderId} — skipping`);
      reminder.status = 'sent';
      reminder.sentAt = new Date();
      return reminder.save();
    }

    reminder.status = 'sent';
    reminder.sentAt = new Date();
    await reminder.save();

    const patient = reminder.patientId as any;
    const patientName = `${patient.firstName} ${patient.lastName}`;
    const patientId = patient._id.toString();

    // Champs manquants depuis la DB au moment de l'envoi
    const { missingVitals, missingSymptoms } = await this._getMissingFields(patientId);

    // Message personnalisé pour le mail
    const personalizedMessage = this.buildPersonalizedMessage(
      patientName,
      missingVitals,
      missingSymptoms,
    );

    // Envoyer email
    if (patient.email) {
      const emailHtml = this.notificationService.buildEmailHtml(
        patientName,
        personalizedMessage,
        missingVitals,
        missingSymptoms,
      );

      const emailSent = await this.notificationService.sendEmail(
        patient.email,
        `MediFollow — Daily Health Reminder for ${patientName}`,
        emailHtml,
      );

      if (emailSent) {
        await this.reminderModel.findByIdAndUpdate(reminderId, {
          emailSent: true,
          emailSentAt: new Date(),
        });
        this.logger.log(`Email sent to ${patient.email} for patient ${patientName}`);
      }
    }

    // Planifier SMS court après 1 minute
    const patientDoc = await this.userModel.findById(patient._id).lean();
    if (patientDoc) {
      this._scheduleSmsCheck(reminderId, patientId, patientName, patientDoc);
    }

    return reminder;
  }

  private _scheduleSmsCheck(
    reminderId: string,
    patientId: string,
    patientName: string,
    patient: any,
  ): void {
    setTimeout(async () => {
      try {
        const reminder = await this.reminderModel.findById(reminderId);
        if (!reminder || reminder.smsJobDone) return;

        const { missingVitals, missingSymptoms } = await this._getMissingFields(patientId);
        const stillNonCompliant = missingVitals.length > 0 || missingSymptoms.length > 0;

        if (stillNonCompliant) {
          const emergencyContact = patient.emergencyContact;

          if (emergencyContact) {
            // SMS très court
            const smsMessage = `MediFollow: Please submit now. Your health team is monitoring.`;

            const smsSent = await this.notificationService.sendSms(emergencyContact, smsMessage);

            if (smsSent) {
              await this.reminderModel.findByIdAndUpdate(reminderId, {
                smsSent: true,
                smsSentAt: new Date(),
                smsJobDone: true,
              });
              this.logger.log(
                `SMS sent to ${emergencyContact} for patient ${patientName}`,
              );
            } else {
              await this.reminderModel.findByIdAndUpdate(reminderId, { smsJobDone: true });
            }
          } else {
            this.logger.warn(`No emergency contact for ${patientName} — SMS skipped`);
            await this.reminderModel.findByIdAndUpdate(reminderId, { smsJobDone: true });
          }
        } else {
          this.logger.log(`Patient ${patientName} submitted — SMS not needed`);
          await this.reminderModel.findByIdAndUpdate(reminderId, { smsJobDone: true });
        }
      } catch (err) {
        this.logger.error(`SMS check error for reminder ${reminderId}: ${err.message}`);
      }
    }, 1 * 60 * 1000);
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

  async updateReminder(
    reminderId: string,
    body: { type: string; message: string; scheduledAt?: string },
  ) {
    const reminder = await this.reminderModel.findById(reminderId).exec();
    if (!reminder) throw new NotFoundException('Reminder not found');
    reminder.type = body.type;
    reminder.message = body.message;
    if (body.scheduledAt) reminder.scheduledAt = new Date(body.scheduledAt);
    return reminder.save();
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { Symptoms } from './symptoms.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SymptomsDocument } from './symptoms.schema';
import { User, UserDocument } from '../users/user.schema';
import { AutoAlertsService } from '../auto-alerts/auto-alerts.service';
import { AutoAlertType } from '../auto-alerts/auto-alert.schema';

@Injectable()
export class SymptomsService {
  constructor(
    @InjectModel(Symptoms.name) private symptomsModel: Model<SymptomsDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly alertsService: AutoAlertsService,
  ) {}

  // CREATE SYMPTOMS
  async createSymptoms(data: Partial<Symptoms>): Promise<Symptoms> {
    if (!data.patientId || !Types.ObjectId.isValid(data.patientId)) {
      throw new BadRequestException('patientId invalide');
    }
    if (!data.reportedBy || !Types.ObjectId.isValid(data.reportedBy)) {
      throw new BadRequestException('reportedBy invalide');
    }

    const patientExists = await this.userModel.exists({ _id: data.patientId });
    if (!patientExists) {
      throw new BadRequestException('patientId non trouve dans la base');
    }

    const reportedByExists = await this.userModel.exists({ _id: data.reportedBy });
    if (!reportedByExists) {
      throw new BadRequestException('reportedBy non trouve dans la base');
    }

    const entry = new this.symptomsModel({
      ...data,
      patientId: new Types.ObjectId(data.patientId),
      reportedBy: new Types.ObjectId(data.reportedBy),
    });

    const saved = await entry.save();

    // Generation d'alertes si seuils depasses
    await this.checkSymptomAlerts(data);

    return saved;
  }

  // Verification des seuils symptomes
  private async checkSymptomAlerts(data: Partial<Symptoms>): Promise<void> {
    const patientId = data.patientId!;

    if (data.painLevel !== undefined && data.painLevel >= 8) {
      await this.alertsService.createAlert({
        patientId,
        type: AutoAlertType.SYMPTOM,
        parameter: 'painLevel',
        value: data.painLevel,
        message: `Douleur intense signalee : ${data.painLevel}/10`,
      });
    }

    if (data.fatigueLevel !== undefined && data.fatigueLevel >= 8) {
      await this.alertsService.createAlert({
        patientId,
        type: AutoAlertType.SYMPTOM,
        parameter: 'fatigueLevel',
        value: data.fatigueLevel,
        message: `Fatigue intense signalee : ${data.fatigueLevel}/10`,
      });
    }

    if (data.shortnessOfBreath === true) {
      await this.alertsService.createAlert({
        patientId,
        type: AutoAlertType.SYMPTOM,
        parameter: 'shortnessOfBreath',
        message: `Essoufflement signale par le patient`,
      });
    }
  }

  // GET ALL SYMPTOMS
  async getAllSymptoms(): Promise<Symptoms[]> {
    return this.symptomsModel
      .find()
      .populate('patientId')
      .populate('reportedBy')
      .exec();
  }

  // GET SYMPTOMS BY PATIENT
  async getByPatient(patientId: string): Promise<Symptoms[]> {
    return this.symptomsModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .sort({ reportedAt: -1 })
      .exec();
  }

  // CHECK IF PATIENT REPORTED SYMPTOMS TODAY
  async hasEnteredToday(patientId: string): Promise<boolean> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const count = await this.symptomsModel.countDocuments({
      patientId: new Types.ObjectId(patientId),
      reportedAt: { $gte: start, $lte: end },
    });
    return count > 0;
  }
}
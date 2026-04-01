import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  QuestionnaireResponse,
  QuestionnaireResponseDocument,
} from './questionnaire-response.schema';

@Injectable()
export class QuestionnaireResponseService {
  constructor(
    @InjectModel(QuestionnaireResponse.name)
    private responseModel: Model<QuestionnaireResponseDocument>,
  ) {}

  async create(data: {
    patientId: string;
    answers: Record<string, string>;
    templateId?: string;
  }): Promise<QuestionnaireResponse> {
    if (!data.patientId || !Types.ObjectId.isValid(data.patientId)) {
      throw new BadRequestException('patientId invalide');
    }
    const entry = new this.responseModel({
      patientId: new Types.ObjectId(data.patientId),
      templateId: data.templateId && Types.ObjectId.isValid(data.templateId)
        ? new Types.ObjectId(data.templateId)
        : null,
      answers: data.answers,
      submittedAt: new Date(),
    });
    return entry.save();
  }

  async getByPatient(patientId: string): Promise<QuestionnaireResponse[]> {
    return this.responseModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .sort({ submittedAt: -1 })
      .exec();
  }

  async hasRespondedToday(patientId: string): Promise<boolean> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const count = await this.responseModel.countDocuments({
      patientId: new Types.ObjectId(patientId),
      submittedAt: { $gte: start, $lte: end },
    });
    return count > 0;
  }

  async hasCompletedTemplate(patientId: string, templateId: string): Promise<boolean> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const count = await this.responseModel.countDocuments({
      patientId: new Types.ObjectId(patientId),
      templateId: new Types.ObjectId(templateId),
      submittedAt: { $gte: start, $lte: end },
    });
    return count > 0;
  }
}

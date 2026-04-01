import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  QuestionnaireTemplate,
  QuestionnaireTemplateDocument,
} from './questionnaire-template.schema';

@Injectable()
export class QuestionnaireTemplatesService {
  constructor(
    @InjectModel(QuestionnaireTemplate.name)
    private templateModel: Model<QuestionnaireTemplateDocument>,
  ) {}

  async create(dto: {
    title: string;
    description?: string;
    questions: any[];
    createdBy?: string;
    assignedTo?: string[];
  }): Promise<QuestionnaireTemplateDocument> {
    const doc = new this.templateModel({
      ...dto,
      createdBy: dto.createdBy ? new Types.ObjectId(dto.createdBy) : undefined,
      assignedTo: (dto.assignedTo ?? []).map(id => new Types.ObjectId(id)),
    });
    return doc.save();
  }

  async getAll(): Promise<QuestionnaireTemplateDocument[]> {
    return this.templateModel.find({ active: true }).sort({ createdAt: -1 }).exec();
  }

  async getAssignedToPatient(patientId: string): Promise<QuestionnaireTemplateDocument[]> {
    return this.templateModel
      .find({
        active: true,
        assignedTo: new Types.ObjectId(patientId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async assignToPatient(templateId: string, patientId: string): Promise<QuestionnaireTemplateDocument> {
    const template = await this.templateModel.findById(templateId).exec();
    if (!template) throw new NotFoundException('Template not found');
    const pid = new Types.ObjectId(patientId);
    if (!template.assignedTo.some(id => id.equals(pid))) {
      template.assignedTo.push(pid);
      await template.save();
    }
    return template;
  }
}
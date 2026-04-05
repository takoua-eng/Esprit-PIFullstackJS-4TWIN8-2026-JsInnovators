import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Questionnaire, QuestionnaireDocument } from './questionnaires.schema';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';

@Injectable()
export class QuestionnairesService {
  constructor(
    @InjectModel(Questionnaire.name)
    private questionnaireModel: Model<QuestionnaireDocument>,
  ) {}

  async create(createQuestionnaireDto: CreateQuestionnaireDto): Promise<QuestionnaireDocument> {
    const questionnaire = new this.questionnaireModel({
      ...createQuestionnaireDto,
      patientId: new Types.ObjectId(createQuestionnaireDto.patientId),
      templateId: createQuestionnaireDto.templateId ? new Types.ObjectId(createQuestionnaireDto.templateId) : undefined,
      submittedBy: createQuestionnaireDto.submittedBy ? new Types.ObjectId(createQuestionnaireDto.submittedBy) : undefined,
      submittedAt: createQuestionnaireDto.status === 'completed' ? new Date() : undefined,
    });
    return questionnaire.save();
  }

  async findAll(): Promise<QuestionnaireDocument[]> {
    return this.questionnaireModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByPatient(patientId: string): Promise<QuestionnaireDocument[]> {
    return this.questionnaireModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<QuestionnaireDocument> {
    const questionnaire = await this.questionnaireModel.findById(id).exec();
    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${id} not found`);
    }
    return questionnaire;
  }

  async update(id: string, updateQuestionnaireDto: UpdateQuestionnaireDto): Promise<QuestionnaireDocument> {
    const updateData: any = { ...updateQuestionnaireDto };
    if (updateQuestionnaireDto.patientId) {
      updateData.patientId = new Types.ObjectId(updateQuestionnaireDto.patientId);
    }
    if (updateQuestionnaireDto.templateId) {
      updateData.templateId = new Types.ObjectId(updateQuestionnaireDto.templateId);
    }
    if (updateQuestionnaireDto.submittedBy) {
      updateData.submittedBy = new Types.ObjectId(updateQuestionnaireDto.submittedBy);
    }
    if (updateQuestionnaireDto.status === 'completed' && !updateData.submittedAt) {
      updateData.submittedAt = new Date();
    }

    const questionnaire = await this.questionnaireModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${id} not found`);
    }
    return questionnaire;
  }

  async remove(id: string): Promise<void> {
    const result = await this.questionnaireModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Questionnaire with ID ${id} not found`);
    }
  }
}
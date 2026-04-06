import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QuestionnaireTemplateService } from '../questionnaire-template/questionnaire-template.service';
import { CreateInstanceDto } from './dto/create-instance.dto';
import {
  QuestionnaireInstance,
  QuestionnaireInstanceDocument,
} from './questionnaire-instance.schema';

@Injectable()
export class QuestionnaireInstanceService {
  private readonly logger = new Logger(QuestionnaireInstanceService.name);

  constructor(
    @InjectModel(QuestionnaireInstance.name)
    private readonly instanceModel: Model<QuestionnaireInstanceDocument>,
    private readonly templateService: QuestionnaireTemplateService,
  ) {}

  async create(dto: CreateInstanceDto): Promise<QuestionnaireInstanceDocument> {
    const template = await this.templateService.findOne(dto.templateId);

    const extra = dto.extraQuestions ?? [];
    if (extra.length > 0 && !template.allowDoctorToAddQuestions) {
      throw new BadRequestException(
        "Ce modèle n'autorise pas l'ajout de questions supplémentaires par le médecin",
      );
    }

    const clonedQuestions = template.questions.map((q) => ({
      label: q.label,
      type: q.type,
      options: [...(q.options ?? [])],
      required: q.required ?? false,
    }));

    const mergedExtra = extra.map((q) => ({
      label: q.label,
      type: q.type,
      options: q.options ?? [],
      required: q.required ?? false,
    }));

    const questions = [...clonedQuestions, ...mergedExtra];

    try {
      const created = await this.instanceModel.create({
        templateId: new Types.ObjectId(dto.templateId),
        patientId: new Types.ObjectId(dto.patientId),
        doctorId: new Types.ObjectId(dto.doctorId),
        questions,
      });
      return created;
    } catch (err) {
      this.logger.error(
        `Échec création instance: ${err instanceof Error ? err.message : err}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Impossible de créer l’instance de questionnaire',
      );
    }
  }

  async findByDoctor(doctorId: string): Promise<QuestionnaireInstanceDocument[]> {
    return this.instanceModel
      .find({ doctorId: new Types.ObjectId(doctorId) })
      .populate('templateId', 'title description')
      .populate('patientId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByPatient(patientId: string): Promise<QuestionnaireInstanceDocument[]> {
    return this.instanceModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .populate('templateId', 'title description')
      .populate('doctorId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<QuestionnaireInstanceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID invalide');
    }
    const instance = await this.instanceModel
      .findById(id)
      .populate('templateId', 'title description')
      .populate('patientId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName')
      .exec();
    if (!instance) {
      throw new BadRequestException('Instance introuvable');
    }
    return instance;
  }
}

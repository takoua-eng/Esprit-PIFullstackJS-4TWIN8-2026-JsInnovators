import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { Question, QuestionType } from '../questionnaire-question/question.schema';
import {
  QuestionnaireInstance,
  QuestionnaireInstanceDocument,
} from '../questionnaire-instance/questionnaire-instance.schema';
import { CreateQuestionnaireResponseDto } from './dto/create-questionnaire-response.dto';
import {
  QuestionnaireResponse,
  QuestionnaireResponseDocument,
} from './questionnaire-response.schema';
import { AlertsService } from '../alerts/alerts.service';

function isEmptyAnswer(type: QuestionType, value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  switch (type) {
    case 'text':
    case 'single_choice':
      return typeof value !== 'string' || value.trim() === '';
    case 'number':
      return typeof value !== 'number' || Number.isNaN(value);
    case 'multiple_choice':
      return (
        !Array.isArray(value) ||
        value.length === 0 ||
        !value.every((v) => typeof v === 'string')
      );
    default:
      return true;
  }
}

function assertValueMatchesQuestionType(
  question: Question & { _id?: Types.ObjectId },
  value: unknown,
): void {
  const id = question._id?.toString() ?? '?';

  switch (question.type) {
    case 'multiple_choice': {
      if (!Array.isArray(value)) {
        throw new BadRequestException(
          `Question ${id} (multiple_choice) : la valeur doit être un tableau de chaînes`,
        );
      }
      if (!value.every((v) => typeof v === 'string')) {
        throw new BadRequestException(
          `Question ${id} (multiple_choice) : chaque option doit être une chaîne`,
        );
      }
      return;
    }
    case 'text':
    case 'single_choice': {
      if (typeof value !== 'string') {
        throw new BadRequestException(
          `Question ${id} (${question.type}) : une chaîne est attendue`,
        );
      }
      return;
    }
    case 'number': {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new BadRequestException(
          `Question ${id} (number) : un nombre est attendu`,
        );
      }
      return;
    }
    default:
      throw new BadRequestException(`Type de question inconnu (${id})`);
  }
}

@Injectable()
export class QuestionnaireResponseService {
  constructor(
    @InjectModel(QuestionnaireResponse.name)
    private responseModel: Model<QuestionnaireResponseDocument>,
    @InjectModel(QuestionnaireInstance.name)
    private instanceModel: Model<QuestionnaireInstanceDocument>,
    private readonly alertsService: AlertsService,
  ) {}

  async create(
    dto: CreateQuestionnaireResponseDto,
  ): Promise<QuestionnaireResponseDocument> {
    const instance = await this.instanceModel
      .findById(dto.questionnaireInstanceId)
      .exec();
    if (!instance) {
      throw new NotFoundException('Instance de questionnaire introuvable');
    }

    if (instance.patientId.toString() !== dto.patientId) {
      throw new BadRequestException(
        'Le patient ne correspond pas à cette instance',
      );
    }

    const questionById = new Map<
      string,
      Question & { _id: Types.ObjectId }
    >();
    for (const q of instance.questions) {
      const sub = q as Question & { _id?: Types.ObjectId };
      if (sub._id) {
        questionById.set(sub._id.toString(), sub as Question & { _id: Types.ObjectId });
      }
    }

    const seen = new Set<string>();
    for (const a of dto.answers) {
      if (seen.has(a.questionId)) {
        throw new BadRequestException(
          `Question dupliquée dans les réponses : ${a.questionId}`,
        );
      }
      seen.add(a.questionId);
    }

    const answerByQuestionId = new Map(
      dto.answers.map((a) => [a.questionId, a.value] as const),
    );

    for (const [qid, question] of questionById) {
      const value = answerByQuestionId.get(qid);
      if (question.required) {
        if (value === undefined || isEmptyAnswer(question.type, value)) {
          throw new BadRequestException(
            `La question obligatoire « ${question.label} » (${qid}) doit être renseignée`,
          );
        }
      }
    }

    for (const [qid, value] of answerByQuestionId) {
      const question = questionById.get(qid);
      if (!question) {
        throw new BadRequestException(
          `Identifiant de question inconnu pour cette instance : ${qid}`,
        );
      }
      assertValueMatchesQuestionType(question, value);
    }

    const answers = dto.answers.map((a) => ({
      questionId: new Types.ObjectId(a.questionId),
      value: a.value as string | number | string[],
    }));

    const entry = new this.responseModel({
      questionnaireInstanceId: new Types.ObjectId(dto.questionnaireInstanceId),
      patientId: new Types.ObjectId(dto.patientId),
      doctorId: instance.doctorId, // Extract from instance
      answers,
    });
    const saved = await entry.save();

    // Trigger alert for doctor
    try {
      await this.alertsService.createPhysicianAlert({
        patientId: dto.patientId,
        physicianUserId: instance.doctorId.toString(),
        severity: 'medium',
        type: 'questionnaire_submission',
        message: `New questionnaire response submitted by patient.`,
        sourceType: 'questionnaire_response',
        sourceId: saved._id.toString(),
      });
    } catch (e) {
      console.error('Failed to trigger alert for questionnaire submission', e);
    }

    return saved;
  }

  async updateReview(
    id: string,
    doctorId: string,
    review: { reviewedByDoctor: boolean; doctorNotes?: string },
  ): Promise<QuestionnaireResponseDocument> {
    const response = await this.responseModel.findById(id).exec();
    if (!response) {
      throw new NotFoundException('Response not found');
    }

    // Optimization: check if doctor is assigned to this patient/response
    if (response.doctorId.toString() !== doctorId) {
      throw new BadRequestException('You are not authorized to review this response');
    }

    response.reviewedByDoctor = review.reviewedByDoctor;
    if (review.doctorNotes !== undefined) {
      response.doctorNotes = review.doctorNotes;
    }

    return response.save();
  }

  async getByPatient(patientId: string): Promise<QuestionnaireResponse[]> {
    return this.responseModel
      .find({ patientId: new Types.ObjectId(patientId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async hasRespondedToday(patientId: string): Promise<boolean> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const count = await this.responseModel.countDocuments({
      patientId: new Types.ObjectId(patientId),
      createdAt: { $gte: start, $lte: end },
    });
    return count > 0;
  }

  async hasCompletedTemplate(
    patientId: string,
    templateId: string,
  ): Promise<boolean> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const instances = await this.instanceModel
      .find({
        templateId: new Types.ObjectId(templateId),
        patientId: new Types.ObjectId(patientId),
      })
      .select('_id')
      .lean()
      .exec();

    const instanceIds = instances.map((i) => i._id);
    if (instanceIds.length === 0) {
      return false;
    }

    const count = await this.responseModel.countDocuments({
      patientId: new Types.ObjectId(patientId),
      questionnaireInstanceId: { $in: instanceIds },
      createdAt: { $gte: start, $lte: end },
    });
    return count > 0;
  }
}

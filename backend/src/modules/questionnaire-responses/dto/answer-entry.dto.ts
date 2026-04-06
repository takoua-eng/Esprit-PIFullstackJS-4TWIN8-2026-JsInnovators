import { Allow, IsMongoId, IsNotEmpty } from 'class-validator';

export class AnswerEntryDto {
  @IsNotEmpty()
  @IsMongoId()
  questionId: string;

  /** Validé dans QuestionnaireResponseService selon le type de question */
  @Allow()
  value: unknown;
}

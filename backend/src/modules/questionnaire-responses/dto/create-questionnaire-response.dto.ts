import { Type } from 'class-transformer';
import {
  Allow,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { AnswerEntryDto } from './answer-entry.dto';

export class CreateQuestionnaireResponseDto {
  @IsNotEmpty()
  @IsMongoId()
  questionnaireInstanceId: string;

  @IsNotEmpty()
  @IsMongoId()
  patientId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerEntryDto)
  answers: AnswerEntryDto[];
}

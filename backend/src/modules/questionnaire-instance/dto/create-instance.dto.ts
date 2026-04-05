import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { QuestionDto } from '../../questionnaire-template/dto/question.dto';

export class CreateInstanceDto {
  @IsNotEmpty()
  @IsMongoId()
  templateId: string;

  @IsNotEmpty()
  @IsMongoId()
  patientId: string;

  @IsNotEmpty()
  @IsMongoId()
  doctorId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  extraQuestions?: QuestionDto[];
}

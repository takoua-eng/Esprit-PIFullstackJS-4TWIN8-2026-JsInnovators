import { IsString, IsOptional, IsArray, IsMongoId, IsEnum } from 'class-validator';

export class AnswerItemDto {
  @IsString()
  questionKey: string;

  answer: string | number;
}

export class CreateQuestionnaireDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  answers: AnswerItemDto[];

  @IsMongoId()
  patientId: string;

  @IsOptional()
  @IsMongoId()
  templateId?: string;

  @IsOptional()
  @IsMongoId()
  submittedBy?: string;

  @IsOptional()
  @IsEnum(['pending', 'completed', 'reviewed'])
  status?: 'pending' | 'completed' | 'reviewed';
}
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export const QUESTION_TYPES = [
  'text',
  'number',
  'single_choice',
  'multiple_choice',
] as const;

export type QuestionDtoType = (typeof QUESTION_TYPES)[number];

function isChoiceType(type: unknown): boolean {
  return type === 'single_choice' || type === 'multiple_choice';
}

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNotEmpty()
  @IsIn(QUESTION_TYPES)
  type: QuestionDtoType;

  @ValidateIf((o: QuestionDto) => isChoiceType(o.type))
  @IsArray()
  @ArrayMinSize(1, {
    message: 'options must contain at least one value when type is single_choice or multiple_choice',
  })
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

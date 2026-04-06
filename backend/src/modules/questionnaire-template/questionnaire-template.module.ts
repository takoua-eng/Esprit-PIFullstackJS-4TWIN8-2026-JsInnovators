import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionnaireQuestionModule } from '../questionnaire-question/questionnaire-question.module';
import {
  QuestionnaireTemplate,
  QuestionnaireTemplateSchema,
} from './questionnaire-template.schema';
import { QuestionnaireTemplateController } from './questionnaire-template.controller';
import { QuestionnaireTemplateService } from './questionnaire-template.service';

@Module({
  imports: [
    QuestionnaireQuestionModule,
    MongooseModule.forFeature([
      {
        name: QuestionnaireTemplate.name,
        schema: QuestionnaireTemplateSchema,
      },
    ]),
  ],
  controllers: [QuestionnaireTemplateController],
  providers: [QuestionnaireTemplateService],
  exports: [MongooseModule, QuestionnaireTemplateService],
})
export class QuestionnaireTemplateModule {}

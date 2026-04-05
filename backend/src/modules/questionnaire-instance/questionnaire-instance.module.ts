import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionnaireQuestionModule } from '../questionnaire-question/questionnaire-question.module';
import { QuestionnaireTemplateModule } from '../questionnaire-template/questionnaire-template.module';
import {
  QuestionnaireInstance,
  QuestionnaireInstanceSchema,
} from './questionnaire-instance.schema';
import { QuestionnaireInstanceController } from './questionnaire-instance.controller';
import { QuestionnaireInstanceService } from './questionnaire-instance.service';

@Module({
  imports: [
    QuestionnaireQuestionModule,
    QuestionnaireTemplateModule,
    MongooseModule.forFeature([
      {
        name: QuestionnaireInstance.name,
        schema: QuestionnaireInstanceSchema,
      },
    ]),
  ],
  controllers: [QuestionnaireInstanceController],
  providers: [QuestionnaireInstanceService],
  exports: [MongooseModule, QuestionnaireInstanceService],
})
export class QuestionnaireInstanceModule {}

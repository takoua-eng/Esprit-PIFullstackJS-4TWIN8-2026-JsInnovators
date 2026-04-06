import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionnairesService } from './questionnaires.service';
import { QuestionnairesController } from './questionnaires.controller';
import { QuestionnairesApiController } from './questionnaires-api.controller';
import { Questionnaire, QuestionnaireSchema } from './questionnaires.schema';
import { QuestionnaireTemplateModule } from '../questionnaire-template/questionnaire-template.module';
import { QuestionnaireInstanceModule } from '../questionnaire-instance/questionnaire-instance.module';

@Module({
  imports: [
    QuestionnaireTemplateModule,
    QuestionnaireInstanceModule,
    MongooseModule.forFeature([
      { name: Questionnaire.name, schema: QuestionnaireSchema },
    ]),
  ],
  controllers: [QuestionnairesController, QuestionnairesApiController],
  providers: [QuestionnairesService],
  exports: [QuestionnairesService],
})
export class QuestionnairesModule {}

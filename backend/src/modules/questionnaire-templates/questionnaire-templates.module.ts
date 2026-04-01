import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  QuestionnaireTemplate,
  QuestionnaireTemplateSchema,
} from './questionnaire-template.schema';
import { QuestionnaireTemplatesService } from './questionnaire-templates.service';
import { QuestionnaireTemplatesController } from './questionnaire-templates.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuestionnaireTemplate.name, schema: QuestionnaireTemplateSchema },
    ]),
  ],
  controllers: [QuestionnaireTemplatesController],
  providers: [QuestionnaireTemplatesService],
  exports: [QuestionnaireTemplatesService],
})
export class QuestionnaireTemplatesModule {}
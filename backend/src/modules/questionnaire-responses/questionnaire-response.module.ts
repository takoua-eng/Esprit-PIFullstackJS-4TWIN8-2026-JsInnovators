import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionnaireInstanceModule } from '../questionnaire-instance/questionnaire-instance.module';
import {
  QuestionnaireResponse,
  QuestionnaireResponseSchema,
} from './questionnaire-response.schema';
import { QuestionnaireResponseService } from './questionnaire-response.service';
import { QuestionnaireResponseController } from './questionnaire-response.controller';

@Module({
  imports: [
    QuestionnaireInstanceModule,
    MongooseModule.forFeature([
      { name: QuestionnaireResponse.name, schema: QuestionnaireResponseSchema },
    ]),
  ],
  controllers: [QuestionnaireResponseController],
  providers: [QuestionnaireResponseService],
})
export class QuestionnaireResponseModule {}

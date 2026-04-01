import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { QuestionnaireResponseService } from './questionnaire-response.service';

@Controller('questionnaire-responses')
export class QuestionnaireResponseController {
  constructor(private readonly service: QuestionnaireResponseService) {}

  // POST /questionnaire-responses  → submit answers
  @Post()
  create(@Body() body: { patientId: string; answers: Record<string, string>; templateId?: string }) {
    return this.service.create(body);
  }

  // GET /questionnaire-responses/patient/:patientId  → patient history
  @Get('patient/:patientId')
  getByPatient(@Param('patientId') patientId: string) {
    return this.service.getByPatient(patientId);
  }

  // GET /questionnaire-responses/patient/:patientId/today
  @Get('patient/:patientId/today')
  hasRespondedToday(@Param('patientId') patientId: string) {
    return this.service.hasRespondedToday(patientId);
  }

  // GET /questionnaire-responses/patient/:patientId/template/:templateId
  @Get('patient/:patientId/template/:templateId')
  hasCompletedTemplate(
    @Param('patientId') patientId: string,
    @Param('templateId') templateId: string,
  ) {
    return this.service.hasCompletedTemplate(patientId, templateId);
  }
}

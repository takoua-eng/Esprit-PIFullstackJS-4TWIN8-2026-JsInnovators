import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QuestionnaireTemplatesService } from './questionnaire-templates.service';

@Controller('questionnaire-templates')
export class QuestionnaireTemplatesController {
  constructor(private readonly service: QuestionnaireTemplatesService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Get('patient/:patientId')
  getForPatient(@Param('patientId') patientId: string) {
    return this.service.getAssignedToPatient(patientId);
  }

  @Post(':id/assign/:patientId')
  assign(@Param('id') id: string, @Param('patientId') patientId: string) {
    return this.service.assignToPatient(id, patientId);
  }
}
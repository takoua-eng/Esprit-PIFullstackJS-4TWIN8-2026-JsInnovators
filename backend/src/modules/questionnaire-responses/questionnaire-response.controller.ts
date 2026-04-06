import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateQuestionnaireResponseDto } from './dto/create-questionnaire-response.dto';
import { QuestionnaireResponseService } from './questionnaire-response.service';

@Controller('questionnaire-responses')
export class QuestionnaireResponseController {
  constructor(private readonly service: QuestionnaireResponseService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  create(@Body() dto: CreateQuestionnaireResponseDto) {
    return this.service.create(dto);
  }

  @Get('patient/:patientId')
  getByPatient(@Param('patientId') patientId: string) {
    return this.service.getByPatient(patientId);
  }

  @Get('patient/:patientId/today')
  hasRespondedToday(@Param('patientId') patientId: string) {
    return this.service.hasRespondedToday(patientId);
  }

  @Get('patient/:patientId/template/:templateId')
  hasCompletedTemplate(
    @Param('patientId') patientId: string,
    @Param('templateId') templateId: string,
  ) {
    return this.service.hasCompletedTemplate(patientId, templateId);
  }

  @Get('instance/:instanceId/today')
  hasCompletedInstance(@Param('instanceId') instanceId: string) {
    return this.service.hasCompletedInstance(instanceId);
  }

  @Put(':id/review')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateReview(
    @Param('id') id: string,
    @Query('doctorId') doctorId: string,
    @Body() review: { reviewedByDoctor: boolean; doctorNotes?: string },
  ) {
    return this.service.updateReview(id, doctorId, review);
  }
}

import { Body, Controller, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateInstanceDto } from './dto/create-instance.dto';
import { QuestionnaireInstanceService } from './questionnaire-instance.service';

@Controller('questionnaire-instances')
export class QuestionnaireInstanceController {
  constructor(
    private readonly questionnaireInstanceService: QuestionnaireInstanceService,
  ) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  create(@Body() dto: CreateInstanceDto) {
    return this.questionnaireInstanceService.create(dto);
  }

  @Get('doctor/:doctorId')
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.questionnaireInstanceService.findByDoctor(doctorId);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.questionnaireInstanceService.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionnaireInstanceService.findOne(id);
  }
}

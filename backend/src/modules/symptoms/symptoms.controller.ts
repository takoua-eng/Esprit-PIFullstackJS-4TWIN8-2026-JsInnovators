import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SymptomsService } from './symptoms.service';

@Controller('symptoms')
export class SymptomsController {
  constructor(private readonly symptomsService: SymptomsService) {}

  // CREATE SYMPTOMS
  @Post()
  createSymptoms(@Body() data: any) {
    return this.symptomsService.createSymptoms(data);
  }

  // GET ALL SYMPTOMS
  @Get()
  findAll() {
    return this.symptomsService.getAllSymptoms();
  }

  // GET SYMPTOMS BY PATIENT
  @Get('patient/:patientId')
  getByPatient(@Param('patientId') patientId: string) {
    return this.symptomsService.getByPatient(patientId);
  }

  // DID PATIENT REPORT SYMPTOMS TODAY?
  @Get('patient/:patientId/today')
  hasEnteredToday(@Param('patientId') patientId: string) {
    return this.symptomsService.hasEnteredToday(patientId);
  }
}


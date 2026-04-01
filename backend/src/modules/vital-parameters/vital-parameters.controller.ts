import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { VitalParametersService } from './vital-parameters.service';

@Controller('vital-parameters')
export class VitalParametersController {
  constructor(private readonly vitalService: VitalParametersService) {}

  // ✅ CREATE VITAL PARAMETERS
  @Post()
  createVital(@Body() data: any) {
    return this.vitalService.createVital(data);
  }

  // ✅ GET ALL VITALS
  @Get()
  findAll() {
    return this.vitalService.getAllVitals();
  }

  // ✅ GET VITALS BY PATIENT
  @Get('patient/:patientId')
  getByPatient(@Param('patientId') patientId: string) {
    return this.vitalService.getByPatient(patientId);
  }

  // ✅ GET LATEST VITAL FOR PATIENT
  @Get('patient/:patientId/latest')
  getLatest(@Param('patientId') patientId: string) {
    return this.vitalService.getLatest(patientId);
  }

  // ✅ DID PATIENT ENTER VITALS TODAY?
  @Get('patient/:patientId/today')
  hasEnteredToday(@Param('patientId') patientId: string) {
    return this.vitalService.hasEnteredToday(patientId);
  }
}


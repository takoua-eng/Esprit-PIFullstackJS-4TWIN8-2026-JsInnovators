import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';

class AcknowledgeAlertDto {
  nurseUserId?: string;
}

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll() {
    return this.alertsService.findAll();
  }

  // GET /alerts/patient/:patientId  → toutes les alertes pour un patient donné
  @Get('patient/:patientId')
  getByPatient(@Param('patientId') patientId: string, @Query('status') status?: string) {
    return this.alertsService.getByPatient(patientId, status);
  }

  @Get('stats/open-count')
  async openCount() {
    const count = await this.alertsService.findOpenCount();
    return { count };
  }

  @Patch(':id/acknowledge')
  acknowledge(
    @Param('id') id: string,
    @Body() body: AcknowledgeAlertDto,
  ) {
    return this.alertsService.acknowledge(id, body?.nurseUserId);
  }




}

import { Controller, Get, Param, Patch } from '@nestjs/common';
import { AutoAlertsService } from './auto-alerts.service';

@Controller('auto-alerts')
export class AutoAlertsController {
  constructor(private readonly autoAlertsService: AutoAlertsService) {}

  // GET /auto-alerts/patient/:patientId  → toutes les alertes du patient
  @Get('patient/:patientId')
  getByPatient(@Param('patientId') patientId: string) {
    return this.autoAlertsService.getByPatient(patientId);
  }

  // GET /auto-alerts/patient/:patientId/count  → nombre d'alertes en attente
  @Get('patient/:patientId/count')
  countPending(@Param('patientId') patientId: string) {
    return this.autoAlertsService.countPending(patientId);
  }

  // GET /auto-alerts/patient/:patientId/recent  → 5 dernieres alertes
  @Get('patient/:patientId/recent')
  getRecent(@Param('patientId') patientId: string) {
    return this.autoAlertsService.getRecentByPatient(patientId);
  }

  // PATCH /auto-alerts/:id/resolve  → marquer comme resolue
  @Patch(':id/resolve')
  markResolved(@Param('id') id: string) {
    return this.autoAlertsService.markResolved(id);
  }
}

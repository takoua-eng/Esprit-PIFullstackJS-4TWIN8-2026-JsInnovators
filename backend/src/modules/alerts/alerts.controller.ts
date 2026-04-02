import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
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

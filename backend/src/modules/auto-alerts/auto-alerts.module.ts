import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoAlert, AutoAlertSchema } from './auto-alert.schema';
import { AutoAlertsService } from './auto-alerts.service';
import { AutoAlertsController } from './auto-alerts.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AutoAlert.name, schema: AutoAlertSchema }]),
  ],
  controllers: [AutoAlertsController],
  providers: [AutoAlertsService],
  exports: [AutoAlertsService], // exporte pour VitalParameters et Symptoms
})
export class AutoAlertsModule {}

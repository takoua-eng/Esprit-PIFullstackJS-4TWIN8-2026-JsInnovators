import { Module } from '@nestjs/common';
import { SymptomsController } from './symptoms.controller';
import { SymptomsService } from './symptoms.service';
import { Symptoms, SymptomsSchema } from './symptoms.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AutoAlertsModule } from '../auto-alerts/auto-alerts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Symptoms.name, schema: SymptomsSchema },
    ]),
    UsersModule,
    AutoAlertsModule,
  ],
  controllers: [SymptomsController],
  providers: [SymptomsService]
})
export class SymptomsModule {}


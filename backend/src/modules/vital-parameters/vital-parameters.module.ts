import { Module } from '@nestjs/common';
import { VitalParametersController } from './vital-parameters.controller';
import { VitalParametersService } from './vital-parameters.service';
import { MongooseModule } from '@nestjs/mongoose';
import { VitalParameters, VitalParametersSchema } from './vital-parameters.schema';
import { UsersModule } from '../users/users.module';
import { AutoAlertsModule } from '../auto-alerts/auto-alerts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VitalParameters.name, schema: VitalParametersSchema }
    ]),
    UsersModule,
    AutoAlertsModule,
  ],
  controllers: [VitalParametersController],
  providers: [VitalParametersService]
})
export class VitalParametersModule {}

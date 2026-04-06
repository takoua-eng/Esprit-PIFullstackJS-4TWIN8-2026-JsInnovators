import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Alert, AlertSchema } from './alert.schema';
import { User, UserSchema } from '../users/users.schema';
import { Role, RoleSchema } from '../roles/role.schema';
import {
  VitalParameters,
  VitalParametersSchema,
} from '../vital-parameters/vital-parameters.schema';
import { Vital, VitalSchema } from '../vitals/vital.schema';
import { Symptoms, SymptomsSchema } from '../symptoms/symptoms.schema';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { ClinicalAiSuggestionService } from './clinical-ai-suggestion.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Alert.name, schema: AlertSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: VitalParameters.name, schema: VitalParametersSchema },
      { name: Vital.name, schema: VitalSchema },
      { name: Symptoms.name, schema: SymptomsSchema },
    ]),
  ],
  controllers: [AlertsController],
  providers: [AlertsService, ClinicalAiSuggestionService],
  exports: [AlertsService],
})
export class AlertsModule {}

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuthModule } from './modules/auth/auth.module';
import { UploadModule } from './modules/upload/upload.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { SymptomsModule } from './modules/symptoms/symptoms.module';
import { ServicesModule } from './modules/service/services/services.module';
import { CoordinatorModule } from './modules/coordinator/coordinator.module';
import { VitalParametersModule } from './modules/vital-parameters/vital-parameters.module';
import { AutoAlertsModule } from './modules/auto-alerts/auto-alerts.module';
import { QuestionnaireResponseModule } from './modules/questionnaire-responses/questionnaire-response.module';
import { PatientNotesModule } from './modules/patient-notes/patient-notes.module';
import { QuestionnaireTemplatesModule } from './modules/questionnaire-templates/questionnaire-templates.module';

import { User, UserSchema } from './modules/users/users.schema';
import { Role, RoleSchema } from './modules/roles/role.schema';
import {
  Service,
  ServiceSchema,
} from './modules/service/services/service.schema';

import { Upload, UploadAvatar } from './middleware/upload.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRoot(
      'mongodb+srv://Medifollow:Medifollow2025@cluster0.15l0i6q.mongodb.net/?retryWrites=true&w=majority',
    ),

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),

    UsersModule,
    RolesModule,
    AuthModule,
    UploadModule,
    AlertsModule,
    RemindersModule,
    VitalsModule,
    SymptomsModule,
    ServicesModule,
    CoordinatorModule,
    VitalParametersModule,
    AutoAlertsModule,
    QuestionnaireResponseModule,
    PatientNotesModule,
    QuestionnaireTemplatesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(Upload).forRoutes('upload');

    consumer
      .apply(UploadAvatar)
      .forRoutes({ path: 'users/:id/avatar', method: RequestMethod.POST });
  }
}

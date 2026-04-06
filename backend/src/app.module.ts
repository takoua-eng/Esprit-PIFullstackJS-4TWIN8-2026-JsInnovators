import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DEFAULT_MONGODB_DB_NAME,
  ensureDatabasePathInUri,
  readEnvTrimmed,
} from './config/mongo-env.util';
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
import { VideoCallsModule } from './modules/video-calls/video-calls.module';
import { HospitalizationHandwritingModule } from './modules/hospitalization-handwriting/hospitalization-handwriting.module';
import { QuestionnairesModule } from './modules/questionnaires/questionnaires.module';
import { AdminModule } from './modules/admin/admin.module';
import { User, UserSchema } from './modules/users/users.schema';
import { Role, RoleSchema } from './modules/roles/role.schema';
import { Service, ServiceSchema } from './modules/service/services/service.schema';

import { Upload, UploadAvatar } from './middleware/upload.middleware';
import { MessagesPatientDoctorModule } from './modules/messages-patient-doctor/messages-patient-doctor.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const mongoConfigLogger = new Logger('MongoConfig');

/** Used when `MONGODB_URI` is not set in `.env` (single connection — do not add a second `MongooseModule.forRoot`). */
const DEFAULT_MONGODB_URI =
  'mongodb+srv://Medifollow:Medifollow2025@cluster0.15l0i6q.mongodb.net/?retryWrites=true&w=majority';
import { QuestionnaireTemplate, QuestionnaireTemplateSchema } from './modules/questionnaire-template/questionnaire-template.schema';
import { QuestionnaireResponse, QuestionnaireResponseSchema } from './modules/questionnaire-responses/questionnaire-response.schema';
import { QuestionnaireInstance, QuestionnaireInstanceSchema } from './modules/questionnaire-instance/questionnaire-instance.schema';
import { QuestionnaireTemplateModule } from './modules/questionnaire-template/questionnaire-template.module';
import { QuestionnaireInstanceModule } from './modules/questionnaire-instance/questionnaire-instance.module';
import { JwtStrategy } from './modules/auth/jwt.strategy';

@Module({
  controllers: [AppController],
  
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const dbName =
          readEnvTrimmed(config, 'MONGODB_DB_NAME') || DEFAULT_MONGODB_DB_NAME;
        const mongoUri = readEnvTrimmed(config, 'MONGODB_URI');
        let uri = mongoUri || DEFAULT_MONGODB_URI;

        if (!mongoUri) {
          mongoConfigLogger.warn(
            'MONGODB_URI not set in .env — using DEFAULT_MONGODB_URI in app.module.ts. Set MONGODB_URI to override.',
          );
        }

        uri = ensureDatabasePathInUri(uri, dbName);
        mongoConfigLogger.log(
          `MongoDB: ${uri.startsWith('mongodb+srv') ? 'Atlas' : 'local'} | using database "${dbName}" (alerts & all collections on this connection)`,
        );

        return {
          uri,
          dbName,
          serverSelectionTimeoutMS: 45_000,
          retryWrites: true,
          family: 4,
        };
      },
      inject: [ConfigService],
    }),

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Service.name, schema: ServiceSchema },
      {name: QuestionnaireTemplate.name, schema: QuestionnaireTemplateSchema},
      {name: QuestionnaireResponse.name, schema: QuestionnaireResponseSchema},
      {name: QuestionnaireInstance.name, schema: QuestionnaireInstanceSchema}, 
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
    QuestionnaireTemplateModule,
    QuestionnaireResponseModule,
    MessagesPatientDoctorModule,
    QuestionnaireInstanceModule,
    QuestionnaireTemplateModule,
    VideoCallsModule,
    HospitalizationHandwritingModule,
    QuestionnairesModule,
    AdminModule,
  ],
  providers: [JwtStrategy, AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(Upload).forRoutes('upload');

    consumer
      .apply(UploadAvatar)
      .forRoutes({ path: 'users/:id/avatar', method: RequestMethod.POST });
  }
}
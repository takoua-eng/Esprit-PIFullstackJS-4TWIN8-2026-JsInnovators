import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
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
import { PatientNotesModule } from './modules/patient-notes/patient-notes.module';
import { QuestionnaireTemplatesModule } from './modules/questionnaire-templates/questionnaire-templates.module';
import { VideoCallsModule } from './modules/video-calls/video-calls.module';

import { User, UserSchema } from './modules/users/users.schema';
import { Role, RoleSchema } from './modules/roles/role.schema';
import { Service, ServiceSchema } from './modules/service/services/service.schema';

import { Upload, UploadAvatar } from './middleware/upload.middleware';

const mongoConfigLogger = new Logger('MongoConfig');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const dbName = readEnvTrimmed(config, 'MONGODB_DB_NAME');
        const mongoUri = readEnvTrimmed(config, 'MONGODB_URI');
        let uri =
          mongoUri || 'mongodb://127.0.0.1:27017/medifollow';

        if (!mongoUri && uri.includes('127.0.0.1')) {
          mongoConfigLogger.warn(
            'MONGODB_URI not loaded — using local default. Remove any space before MONGODB_URI in .env, ensure the file is named `.env` (not only `.env.example`), and restart the server.',
          );
        } else {
          uri = ensureDatabasePathInUri(uri, dbName);
          mongoConfigLogger.log(
            `MongoDB: ${uri.startsWith('mongodb+srv') ? 'Atlas' : 'local'} | dbName=${dbName ?? '(from URI)'}`,
          );
        }

        return {
          uri,
          dbName: dbName || undefined,
          serverSelectionTimeoutMS: 45_000,
          retryWrites: true,
          family: 4,
        };
      },
      inject: [ConfigService],
    }),

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
    VideoCallsModule,
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
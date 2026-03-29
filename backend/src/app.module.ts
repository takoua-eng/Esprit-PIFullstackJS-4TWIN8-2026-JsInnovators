import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuthModule } from './modules/auth/auth.module';
import { User, UserSchema } from './modules/users/user.schema';
import { Role, RoleSchema } from './modules/roles/role.schema';
import { Upload, UploadAvatar } from './middleware/upload.middleware';
import { UploadModule } from './modules/upload/upload.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { SymptomsModule } from './modules/symptoms/symptoms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // MongoDB: set MONGODB_URI in backend/.env (see .env.example). Default = local dev.
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI')?.trim() ||
          'mongodb://127.0.0.1:27017/medifollow',
      }),
      inject: [ConfigService],
    }),

    // Déclaration des modèles pour Mongoose
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),

    // Modules applicatifs
    UsersModule,
    RolesModule,
    AuthModule,
    UploadModule,
    AlertsModule,
    RemindersModule,
    VitalsModule,
    SymptomsModule,
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
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../users/users.schema';
import {
  QuestionnaireResponse,
  QuestionnaireResponseSchema,
} from '../questionnaire-responses/questionnaire-response.schema';
import {
  Questionnaire,
  QuestionnaireSchema,
} from '../questionnaires/questionnaires.schema';
import {
  Patient,
  Physician,
  Nurse,
  Coordinator,
  Auditor,
} from './admin.models';
import { TrafficEvent, TrafficEventSchema } from './traffic-event.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: UserSchema, collection: 'users' },
      { name: Physician.name, schema: UserSchema, collection: 'users' },
      { name: Nurse.name, schema: UserSchema, collection: 'users' },
      { name: Coordinator.name, schema: UserSchema, collection: 'users' },
      { name: Auditor.name, schema: UserSchema, collection: 'users' },
      { name: TrafficEvent.name, schema: TrafficEventSchema },
      {
        name: QuestionnaireResponse.name,
        schema: QuestionnaireResponseSchema,
      },
      { name: Questionnaire.name, schema: QuestionnaireSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
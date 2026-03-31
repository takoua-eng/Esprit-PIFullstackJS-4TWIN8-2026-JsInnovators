import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoordinatorController } from './coordinator.controller';
import { CoordinatorService } from './coordinator.service';
import { User, UserSchema } from '../users/user.schema';
import { Reminder, ReminderSchema } from './reminder.schema';

// Schémas légers pour lire les collections de la collègue
import { Schema } from 'mongoose';

const VitalParameterSchema = new Schema({}, { strict: false, collection: 'vitalparameters' });
const SymptomSchema = new Schema({}, { strict: false, collection: 'symptoms' });

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Reminder.name, schema: ReminderSchema },
      { name: 'VitalParameter', schema: VitalParameterSchema },
      { name: 'Symptom', schema: SymptomSchema },
    ]),
  ],
  controllers: [CoordinatorController],
  providers: [CoordinatorService],
})
export class CoordinatorModule {}
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Symptom, SymptomSchema } from './symptom.schema';
import { User, UserSchema } from '../users/users.schema';
import { Role, RoleSchema } from '../roles/role.schema';
import { SymptomsService } from './symptoms.service';
import { SymptomsController } from './symptoms.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Symptom.name, schema: SymptomSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [SymptomsController],
  providers: [SymptomsService],
  exports: [SymptomsService],
})
export class SymptomsModule {}

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/users.schema';
import { Role } from '../modules/roles/role.schema';
import { QuestionnaireTemplate } from 'src/modules/questionnaire-template/questionnaire-template.schema';
import { QuestionnaireInstance } from 'src/modules/questionnaire-instance/questionnaire-instance.schema';
import { QuestionnaireQuestionModule } from 'src/modules/questionnaire-question/questionnaire-question.module';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mongodb',
  host: 'localhost',
  port: 27017,
  database: 'mediflow',
  entities: [User, Role, QuestionnaireTemplate, QuestionnaireInstance],
  synchronize: true,
  logging: true,
};

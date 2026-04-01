import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/users.schema';
import { Role } from '../modules/roles/role.schema';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mongodb',
  host: 'localhost',
  port: 27017,
  database: 'mediflow',
  entities: [User, Role],
  synchronize: true,
  logging: true,
};

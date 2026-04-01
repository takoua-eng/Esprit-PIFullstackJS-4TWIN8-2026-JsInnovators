import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/user.schema';
import { Role } from '../modules/roles/role.schema';
import { Service } from 'src/services/service.schema';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mongodb',
  host: 'localhost',
  port: 27017,
  database: 'mediflow',
  entities: [User, Role, Service],
  synchronize: true,
  logging: true,
};

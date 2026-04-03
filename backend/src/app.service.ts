import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import {
  DEFAULT_MONGODB_DB_NAME,
  readEnvTrimmed,
} from './config/mongo-env.util';

@Injectable()
export class AppService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly config: ConfigService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Which MongoDB database this process is using — compare `database` to the Compass sidebar.
   * No secrets (no full URI).
   */
  getDatabaseInfo(): {
    database: string;
    configuredInEnv: string;
    connectionReady: boolean;
    alertsDataSummaryUrl: string;
  } {
    const configured =
      readEnvTrimmed(this.config, 'MONGODB_DB_NAME') || DEFAULT_MONGODB_DB_NAME;
    const name =
      this.connection.db?.databaseName ?? this.connection.name ?? configured;
    return {
      database: name,
      configuredInEnv: configured,
      connectionReady: this.connection.readyState === 1,
      alertsDataSummaryUrl: '/alerts/data-summary',
    };
  }
}

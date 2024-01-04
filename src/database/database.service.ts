import { MODE } from '@/config/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Initialize1700558286023 } from 'migrations/1700558286023-initialize';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
('typeorm-naming-strategies');

type DatabaseProperties = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

const DEV = MODE !== 'production';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const database = this.configService.get<DatabaseProperties>(
      'database',
    ) as DatabaseProperties;
    return {
      type: DEV ? 'mysql' : 'mariadb',
      host: database.host,
      port: +database.port,
      username: database.username,
      password: database.password,
      database: database.database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false,
      timezone: '+09:00',
      namingStrategy: new SnakeNamingStrategy(),
      migrations: [Initialize1700558286023],
      migrationsRun: DEV,
      logging: DEV,
    };
  }
}

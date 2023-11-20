import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

type DatabaseProperties = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const database = this.configService.get<DatabaseProperties>(
      'database',
    ) as DatabaseProperties;
    return {
      type: 'mariadb',
      host: database.host,
      port: +database.port,
      username: database.username,
      password: database.password,
      database: database.database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false,
      timezone: '+09:00',
    };
  }
}

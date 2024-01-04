import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from '@/config/database.config';
import { MODE } from '@/config/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${MODE}`],
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseService,
    }),
  ],
  providers: [],
  exports: [],
})
export class DatabaseModule {}

import { ApiResponseModule } from '@/api-response/api-response.module';
import { LoggerModule } from '@/logger/logger.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seminar } from './entities/seminar.entity';
import { SeminarsController } from './seminars.controller';
import { SeminarsService } from './seminars.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Seminar]),
    // ConfigModule.forFeature(encodeConfig),
    ApiResponseModule,
    LoggerModule,
  ],
  controllers: [SeminarsController],
  providers: [SeminarsService],
})
export class SeminarsModule {}

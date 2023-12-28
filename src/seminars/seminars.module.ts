import { ApiResponseModule } from '@/api-response/api-response.module';
import { LoggerModule } from '@/logger/logger.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seminar } from './entities/seminar.entity';
import { SeminarsController } from './seminars.controller';
import { SeminarsService } from './seminars.service';
import { UsersModule } from '@/users/users.module';
import { SeminarParticipant } from './entities/seminar-participant.entity';
import { Cover } from './entities/cover.entity';
import encodeConfig from '@/config/encode.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Seminar, SeminarParticipant, Cover]),
    ConfigModule.forFeature(encodeConfig),
    ApiResponseModule,
    LoggerModule,
    UsersModule,
  ],
  controllers: [SeminarsController],
  providers: [SeminarsService],
})
export class SeminarsModule {}

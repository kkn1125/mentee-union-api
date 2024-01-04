import { AuthModule } from '@/auth/auth.module';
import { SocketAuthGuard } from '@/auth/local-channel-auth.guard';
import jwtConfig from '@/config/jwt.config';
import { LoggerModule } from '@/logger/logger.module';
import { MentoringSession } from '@/mentoring-session/entities/mentoring-session.entity';
import { MentoringSessionModule } from '@/mentoring-session/mentoring-session.module';
import { User } from '@/users/entities/user.entity';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentoring } from './entities/mentoring.entity';
import { MentoringController } from './mentoring.controller';
import { MentoringService } from './mentoring.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MentoringSession, Mentoring, User]),
    ConfigModule.forFeature(jwtConfig),
    LoggerModule,
    AuthModule,
    MentoringSessionModule,
  ],
  controllers: [MentoringController],
  providers: [MentoringService, SocketAuthGuard],
})
export class MentoringModule {}

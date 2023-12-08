import { AuthModule } from '@/auth/auth.module';
import { SocketAuthGuard } from '@/auth/local-channel-auth.guard';
import jwtConfig from '@/config/jwt.config';
import { User } from '@/users/entities/user.entity';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentoring } from './entities/mentoring.entity';
import { MentoringController } from './mentoring.controller';
import { MentoringService } from './mentoring.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mentoring, User]),
    ConfigModule.forFeature(jwtConfig),
    AuthModule,
  ],
  controllers: [MentoringController],
  providers: [MentoringService, SocketAuthGuard],
})
export class MentoringModule {}

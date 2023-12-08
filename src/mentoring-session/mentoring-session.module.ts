import { Module } from '@nestjs/common';
import { MentoringSessionService } from './mentoring-session.service';
import { MentoringSessionController } from './mentoring-session.controller';
import { MentoringSession } from './entities/mentoring-session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { User } from '@/users/entities/user.entity';
import { SocketAuthGuard } from '@/auth/local-channel-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([MentoringSession, User]), AuthModule],
  controllers: [MentoringSessionController],
  providers: [MentoringSessionService, SocketAuthGuard],
})
export class MentoringSessionModule {}

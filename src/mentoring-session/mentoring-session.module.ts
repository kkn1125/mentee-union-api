import { AuthModule } from '@/auth/auth.module';
import { SocketAuthGuard } from '@/auth/local-channel-auth.guard';
import { Mentoring } from '@/mentoring/entities/mentoring.entity';
import { Message } from '@/messages/entities/message.entity';
import { ReadMessage } from '@/messages/entities/read-message.entity';
import { MessagesService } from '@/messages/messages.service';
import { Profile } from '@/users/entities/profile.entity';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentoringSession } from './entities/mentoring-session.entity';
import { MentoringSessionGatewayService } from './mentoring-session-gateway.service';
import { MentoringSessionController } from './mentoring-session.controller';
import { MentoringSessionGateway } from './mentoring-session.gateway';
import { MentoringSessionService } from './mentoring-session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MentoringSession,
      Mentoring,
      Profile,
      Message,
      ReadMessage,
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [MentoringSessionController],
  providers: [
    MentoringSessionService,
    SocketAuthGuard,
    MessagesService,
    MentoringSessionGateway,
    MentoringSessionGatewayService,
  ],
})
export class MentoringSessionModule {}

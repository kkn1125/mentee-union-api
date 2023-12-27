import { Module } from '@nestjs/common';
import { MentoringSessionService } from './mentoring-session.service';
import { MentoringSessionController } from './mentoring-session.controller';
import { MentoringSession } from './entities/mentoring-session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/auth/auth.module';
import { User } from '@/users/entities/user.entity';
import { SocketAuthGuard } from '@/auth/local-channel-auth.guard';
import { MentoringSessionGateway } from './mentoring-session.gateway';
import { Message } from '@/messages/entities/message.entity';
import { Mentoring } from '@/mentoring/entities/mentoring.entity';
import { MentoringSessionGatewayService } from './mentoring-session-gateway.service';
import { MessagesModule } from '@/messages/messages.module';
import { MessagesService } from '@/messages/messages.service';
import { ReadMessage } from '@/messages/entities/read-message.entity';
import { UsersService } from '@/users/users.service';
import { UserRecommend } from '@/users/entities/user-recommend.entity';
import { Profile } from '@/users/entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MentoringSession,
      Mentoring,
      User,
      UserRecommend,
      Profile,
      Message,
      ReadMessage,
    ]),
    AuthModule,
  ],
  controllers: [MentoringSessionController],
  providers: [
    MentoringSessionService,
    SocketAuthGuard,
    MessagesService,
    MentoringSessionGateway,
    MentoringSessionGatewayService,
    UsersService,
  ],
})
export class MentoringSessionModule {}

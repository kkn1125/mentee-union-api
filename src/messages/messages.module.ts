import { AuthModule } from '@/auth/auth.module';
import { LoggerModule } from '@/logger/logger.module';
import { MentoringSession } from '@/mentoring-session/entities/mentoring-session.entity';
import { MentoringSessionModule } from '@/mentoring-session/mentoring-session.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ReadMessage } from './entities/read-message.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, ReadMessage, MentoringSession]),
    LoggerModule,
    AuthModule,
    MentoringSessionModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}

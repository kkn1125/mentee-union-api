import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ReadMessage } from './entities/read-message.entity';
import { AuthModule } from '@/auth/auth.module';
import { MentoringSessionModule } from '@/mentoring-session/mentoring-session.module';
import { MentoringSession } from '@/mentoring-session/entities/mentoring-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, ReadMessage, MentoringSession]),
    AuthModule,
    MentoringSessionModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}

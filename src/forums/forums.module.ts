import { LoggerModule } from '@/logger/logger.module';
import { User } from '@/users/entities/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumLike } from './entities/forum-like.entity';
import { Forum } from './entities/forum.entity';
import { ForumsController } from './forums.controller';
import { ForumsService } from './forums.service';

@Module({
  imports: [TypeOrmModule.forFeature([Forum, ForumLike, User]), LoggerModule],
  controllers: [ForumsController],
  providers: [ForumsService],
})
export class ForumsModule {}

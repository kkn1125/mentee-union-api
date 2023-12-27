import { Module } from '@nestjs/common';
import { ForumsService } from './forums.service';
import { ForumsController } from './forums.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forum } from './entities/forum.entity';
import { User } from '@/users/entities/user.entity';
import { ForumLike } from './entities/forum-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Forum, ForumLike, User])],
  controllers: [ForumsController],
  providers: [ForumsService],
})
export class ForumsModule {}

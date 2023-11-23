import { Module } from '@nestjs/common';
import { ForumsService } from './forums.service';
import { ForumsController } from './forums.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Forum } from './entities/forum.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Forum])],
  controllers: [ForumsController],
  providers: [ForumsService],
})
export class ForumsModule {}

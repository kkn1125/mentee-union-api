import { LoggerModule } from '@/logger/logger.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board]), LoggerModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}

import { Module } from '@nestjs/common';
import { MentoringSessionService } from './mentoring-session.service';
import { MentoringSessionController } from './mentoring-session.controller';
import { MentoringSession } from './entities/mentoring-session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([MentoringSession])],
  controllers: [MentoringSessionController],
  providers: [MentoringSessionService],
})
export class MentoringSessionModule {}

import { Module } from '@nestjs/common';
import { MentoringService } from './mentoring.service';
import { MentoringController } from './mentoring.controller';

@Module({
  controllers: [MentoringController],
  providers: [MentoringService],
})
export class MentoringModule {}

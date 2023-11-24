import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentoring } from './entities/mentoring.entity';
import { MentoringController } from './mentoring.controller';
import { MentoringService } from './mentoring.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mentoring])],
  controllers: [MentoringController],
  providers: [MentoringService],
})
export class MentoringModule {}

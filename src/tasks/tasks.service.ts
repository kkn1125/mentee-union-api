import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  @Cron('*/5 * * * * *')
  handleTestCron() {
    console.log('test tictoc');
  }
}

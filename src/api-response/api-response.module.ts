import { Module } from '@nestjs/common';
import { ApiResponseService } from './api-response.service';
import { LoggerService } from '@/logger/logger.service';

@Module({
  providers: [LoggerService, ApiResponseService],
  exports: [ApiResponseService],
})
export class ApiResponseModule {}

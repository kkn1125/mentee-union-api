import { Module } from '@nestjs/common';
import { ApiResponseService } from './api-response.service';

@Module({
  providers: [ApiResponseService]
})
export class ApiResponseModule {}

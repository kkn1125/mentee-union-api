import { LoggerService } from '@/logger/logger.service';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ApiResponseService } from './api-response.service';

@Catch()
export class ApiResponseFilter implements ExceptionFilter {
  constructor(
    private readonly apiResponseService: ApiResponseService,
    private readonly loggerService: LoggerService,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    this.loggerService.trace('catch trace');
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus?.() || 500;
    const message = exception.getResponse?.() || 'Internal Server Error';
    const detail = exception.cause as string | string[];

    const hasMessage =
      typeof message === 'object' && 'message' in (message as any);

    if (exception instanceof QueryFailedError) {
      /* DB 에러 */
      /* 예외 처리는 sentry에서 db 예외처리를 중요하게 다루어야 됨. */
      response.status(status).json(
        this.apiResponseService.output({
          ok: status === 200 || status === 201,
          code: status,
          message: (exception as unknown as QueryFailedErrors).code,
          detail: (exception as unknown as QueryFailedErrors).sqlMessage,
        }),
      );
    } else {
      this.loggerService.log('일반에러', exception, message);
      /* 일반 에러 */
      response.status(status).json(
        this.apiResponseService.output({
          ok: status === 200 || status === 201,
          code: status,
          message: hasMessage ? message['message'] : message,
          detail: detail,
        }),
      );
    }
  }
}

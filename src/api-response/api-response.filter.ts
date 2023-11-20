import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ApiResponseService } from './api-response.service';

/* DB 에러 처리 위한 인터페이스 */
// interface Custom {
//   code: string;
//   sqlMessage: string;
// }
// interface QueryFailedErrors extends QueryFailedError, Custom {}

@Catch()
export class ApiResponseFilter implements ExceptionFilter {
  constructor(private readonly apiResponseService: ApiResponseService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();
    console.log('필터');
    const status = exception.getStatus?.() || 500;
    const message = exception.getResponse?.() || 'Internal Server Error';
    const detail = exception.cause as string | string[];

    const hasMessage =
      typeof message === 'object' && 'message' in (message as any);
    // console.log(Object.keys(exception));
    // console.log(exception.name);
    if (exception instanceof QueryFailedError) {
      /* DB 에러 */
      /* 예외 처리는 sentry에서 db 예외처리를 중요하게 다루어야 됨. */
      response.status(status).json(
        this.apiResponseService.output({
          ok: status === 200 || status === 201,
          code: status,
          message: hasMessage ? message['message'] : message,
          detail: detail,
          // message: (exception as unknown as QueryFailedErrors).code,
          // detail: (exception as unknown as QueryFailedErrors).sqlMessage,
          // path: request.url,
          // timestamp: new Date().toISOString(),
        }),
      );
    } else {
      /* 일반 에러 */
      response.status(status).json(
        this.apiResponseService.output({
          ok: status === 200 || status === 201,
          code: status,
          message: hasMessage ? message['message'] : message,
          detail: detail,
          // path: request.url,
          // timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}

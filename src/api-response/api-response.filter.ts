import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseService } from './api-response.service';

@Catch()
export class ApiResponseFilter implements ExceptionFilter {
  constructor(private readonly apiResponseService: ApiResponseService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();
    console.log(exception);
    const status = exception.getStatus();
    const message = exception.getResponse();
    const detail = exception.cause as string | string[];

    const hasMessage =
      typeof message === 'object' && 'message' in (message as any);

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

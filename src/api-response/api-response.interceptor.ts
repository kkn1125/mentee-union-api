import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, TimeoutError, catchError, map, throwError } from 'rxjs';
import { ApiResponseService } from './api-response.service';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly apiResponseService: ApiResponseService,
    private readonly loggerService: LoggerService,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    this.loggerService.debug('인터셉터');
    return next.handle().pipe(
      map((data) => {
        return this.apiResponseService.output({
          ok: response.statusCode === 200 || response.statusCode === 201,
          code: response.statusCode,
          data,
        });
      }),
      catchError((err) => {
        this.loggerService.error('interceptor error:', err);
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}

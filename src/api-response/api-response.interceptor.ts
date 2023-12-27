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

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  constructor(private readonly apiResponseService: ApiResponseService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    console.log('인터셉터');
    return next.handle().pipe(
      map((data) => {
        // console.log('인터셉터 데이터', data);
        return this.apiResponseService.output({
          ok: response.statusCode === 200 || response.statusCode === 201,
          code: response.statusCode,
          data,
        });
      }),
      catchError((err) => {
        console.log('err', err);
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class ApiResponseService {
  ok?: boolean = true;
  code?: number = 200;
  data?: any;
  message?: string;
  detail?: string | string[];

  output(datas?: {
    ok?: boolean;
    code?: number;
    data?: any;
    message?: string;
    detail?: string | string[];
  }) {
    console.log('서비스', datas.data);
    Object.assign(this, datas);
    const { ok, code, data, message, detail } = this;
    if (detail instanceof Array) {
      return {
        ok,
        code,
        data,
        message,
        ...(detail.length > 0 && { detail }),
      };
    } else {
      return {
        ok,
        code,
        data,
        message,
        ...(detail && { detail }),
      };
    }
  }

  static EXCEPTION(
    message: string,
    kindOfExceptionStatus: HttpStatus,
    details?: string | string[],
  ) {
    if (details) {
      throw new HttpException(message, kindOfExceptionStatus, {
        cause: details,
      });
    } else {
      throw new HttpException(message, kindOfExceptionStatus);
    }
  }

  static BAD_REQUEST(message?: string, details?: string | string[]) {
    this.EXCEPTION(message, HttpStatus.BAD_REQUEST, details);
  }
  static NOT_FOUND(message?: string, details?: string | string[]) {
    this.EXCEPTION(message, HttpStatus.NOT_FOUND, details);
  }
  static FORBIDDEN(message?: string, details?: string | string[]) {
    this.EXCEPTION(message, HttpStatus.FORBIDDEN, details);
  }
  static UNAUTHORIZED(message?: string, details?: string | string[]) {
    this.EXCEPTION(message, HttpStatus.UNAUTHORIZED, details);
  }
}

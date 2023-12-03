import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

@Injectable()
export class ApiResponseService {
  output({
    ok = true,
    code = 200,
    data = undefined,
    message = undefined,
    detail = undefined,
  }: {
    ok?: boolean;
    code?: number;
    data?: any;
    message?: string;
    detail?: number | string | (number | string)[];
  }) {
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
    errorType: HttpStatus,
    message: string,
    details?: number | string | (number | string)[],
  ): void;
  static EXCEPTION(
    errorType: HttpStatus,
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ): void;
  static EXCEPTION(
    errorType: HttpStatus,
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ) {
    console.log('errorOrMessage', errorOrMessage.constructor.name);
    console.log('errorOrMessage', Object.keys(errorOrMessage));
    if (errorOrMessage instanceof QueryFailedError) {
      return new HttpException(
        (errorOrMessage as QueryFailedErrors).code,
        errorType,
        {
          cause: (errorOrMessage as QueryFailedErrors).sqlMessage,
        },
      );
    } else if (errorOrMessage instanceof EntityNotFoundError) {
      /* 404 분기 추가 2023-11-23 02:38:34 */
      return new HttpException('not found', HttpStatus.NOT_FOUND, {
        cause: messageOrDetails,
      });
    } else if (errorOrMessage instanceof JsonWebTokenError) {
      return new HttpException('invalid token', HttpStatus.UNAUTHORIZED, {
        cause: messageOrDetails || errorOrMessage.message,
      });
    } else {
      if (typeof errorOrMessage === 'string' && details === undefined) {
        return new HttpException(errorOrMessage, errorType, {
          cause: messageOrDetails,
        });
      } else {
        return new HttpException(
          messageOrDetails || errorOrMessage.code,
          errorType,
          {
            cause: details,
          },
        );
      }
    }
  }

  static BAD_REQUEST(message: string, details?: string | string[]): void;
  static BAD_REQUEST(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ): void;
  static BAD_REQUEST(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ) {
    throw this.EXCEPTION(
      HttpStatus.BAD_REQUEST,
      errorOrMessage,
      messageOrDetails,
      details,
    );
  }
  static NOT_FOUND(
    message: string,
    details?: number | string | (number | string)[],
  ): void;
  static NOT_FOUND(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ): void;
  static NOT_FOUND(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ) {
    throw this.EXCEPTION(
      HttpStatus.NOT_FOUND,
      errorOrMessage,
      messageOrDetails,
      details,
    );
  }
  static FORBIDDEN(
    message: string,
    details?: number | string | (number | string)[],
  ): void;
  static FORBIDDEN(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ): void;
  static FORBIDDEN(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ) {
    throw this.EXCEPTION(
      HttpStatus.FORBIDDEN,
      errorOrMessage,
      messageOrDetails,
      details,
    );
  }
  static UNAUTHORIZED(
    message: string,
    details?: number | string | (number | string)[],
  ): void;
  static UNAUTHORIZED(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ): void;
  static UNAUTHORIZED(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ) {
    throw this.EXCEPTION(
      HttpStatus.UNAUTHORIZED,
      errorOrMessage,
      messageOrDetails,
      details,
    );
  }
  static SUCCESS(
    message: string,
    details?: number | string | (number | string)[],
  ): void;
  static SUCCESS(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ): void;
  static SUCCESS(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ) {
    throw this.EXCEPTION(
      HttpStatus.OK,
      errorOrMessage,
      messageOrDetails,
      details,
    );
  }
  static CREATED(
    message: string,
    details?: number | string | (number | string)[],
  ): void;
  static CREATED(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ): void;
  static CREATED(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ) {
    throw this.EXCEPTION(
      HttpStatus.CREATED,
      errorOrMessage,
      messageOrDetails,
      details,
    );
  }
  static CONFLICT(
    message: string,
    details?: number | string | (number | string)[],
  ): void;
  static CONFLICT(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ): void;
  static CONFLICT(
    errorOrMessage: any,
    messageOrDetails?: number | string | (number | string)[],
    details?: number | string | (number | string)[],
  ) {
    throw this.EXCEPTION(
      HttpStatus.CONFLICT,
      errorOrMessage,
      messageOrDetails,
      details,
    );
  }
}

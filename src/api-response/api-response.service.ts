import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { QueryFailedErrors } from 'types/global';

@Injectable()
export class ApiResponseService {
  // ok?: boolean = true;
  // code?: number = 200;
  // data?: any;
  // message?: string;
  // detail?: number|string|(number|string)[];

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
    // console.log('서비스', data);
    // Object.assign(this, datas);
    // const { ok, code, data, message, detail } = this;
    // console.log('서비스 데이터', data);
    // console.log('서비스 메세지', message);
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

  // static EXCEPTION(
  //   message: string,
  //   kindOfExceptionStatus: HttpStatus,
  //   details?: number|string|(number|string)[],
  // ) {
  //   if (details) {
  //     throw new HttpException(message, kindOfExceptionStatus, {
  //       cause: details,
  //     });
  //   } else {
  //     throw new HttpException(message, kindOfExceptionStatus);
  //   }
  // }

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
    if (errorOrMessage instanceof QueryFailedError) {
      throw new HttpException(
        (errorOrMessage as QueryFailedErrors).code,
        HttpStatus.BAD_REQUEST,
        {
          cause: (errorOrMessage as QueryFailedErrors).sqlMessage,
        },
      );
    } else {
      if (typeof errorOrMessage === 'string' && details === undefined) {
        throw new HttpException(errorOrMessage, HttpStatus.BAD_REQUEST, {
          cause: messageOrDetails,
        });
      } else {
        throw new HttpException(
          messageOrDetails || errorOrMessage.code,
          HttpStatus.BAD_REQUEST,
          {
            cause: details,
          },
        );
      }
    }
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
    if (errorOrMessage instanceof QueryFailedError) {
      throw new HttpException(
        (errorOrMessage as QueryFailedErrors).code,
        HttpStatus.NOT_FOUND,
        {
          cause: (errorOrMessage as QueryFailedErrors).sqlMessage,
        },
      );
    } else {
      if (typeof errorOrMessage === 'string' && details === undefined) {
        throw new HttpException(errorOrMessage, HttpStatus.NOT_FOUND, {
          cause: messageOrDetails,
        });
      } else {
        throw new HttpException(
          messageOrDetails || errorOrMessage.code,
          HttpStatus.NOT_FOUND,
          {
            cause: details,
          },
        );
      }
    }
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
    if (errorOrMessage instanceof QueryFailedError) {
      throw new HttpException(
        (errorOrMessage as QueryFailedErrors).code,
        HttpStatus.FORBIDDEN,
        {
          cause: (errorOrMessage as QueryFailedErrors).sqlMessage,
        },
      );
    } else {
      if (typeof errorOrMessage === 'string' && details === undefined) {
        throw new HttpException(errorOrMessage, HttpStatus.FORBIDDEN, {
          cause: messageOrDetails,
        });
      } else {
        throw new HttpException(
          messageOrDetails || errorOrMessage.code,
          HttpStatus.FORBIDDEN,
          {
            cause: details,
          },
        );
      }
    }
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
    if (errorOrMessage instanceof QueryFailedError) {
      throw new HttpException(
        (errorOrMessage as QueryFailedErrors).code,
        HttpStatus.UNAUTHORIZED,
        {
          cause: (errorOrMessage as QueryFailedErrors).sqlMessage,
        },
      );
    } else {
      if (typeof errorOrMessage === 'string' && details === undefined) {
        throw new HttpException(errorOrMessage, HttpStatus.UNAUTHORIZED, {
          cause: messageOrDetails,
        });
      } else {
        throw new HttpException(
          messageOrDetails || errorOrMessage.code,
          HttpStatus.UNAUTHORIZED,
          {
            cause: details,
          },
        );
      }
    }
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
    if (errorOrMessage instanceof QueryFailedError) {
      throw new HttpException(
        (errorOrMessage as QueryFailedErrors).code,
        HttpStatus.OK,
        {
          cause: (errorOrMessage as QueryFailedErrors).sqlMessage,
        },
      );
    } else {
      if (typeof errorOrMessage === 'string' && details === undefined) {
        throw new HttpException(errorOrMessage, HttpStatus.OK, {
          cause: messageOrDetails,
        });
      } else {
        throw new HttpException(
          messageOrDetails || errorOrMessage.code,
          HttpStatus.OK,
          {
            cause: details,
          },
        );
      }
    }
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
    if (errorOrMessage instanceof QueryFailedError) {
      throw new HttpException(
        (errorOrMessage as QueryFailedErrors).code,
        HttpStatus.CREATED,
        {
          cause: (errorOrMessage as QueryFailedErrors).sqlMessage,
        },
      );
    } else {
      if (typeof errorOrMessage === 'string' && details === undefined) {
        throw new HttpException(errorOrMessage, HttpStatus.CREATED, {
          cause: messageOrDetails,
        });
      } else {
        throw new HttpException(
          messageOrDetails || errorOrMessage.code,
          HttpStatus.CREATED,
          {
            cause: details,
          },
        );
      }
    }
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
    if (errorOrMessage instanceof QueryFailedError) {
      throw new HttpException(
        (errorOrMessage as QueryFailedErrors).code,
        HttpStatus.CONFLICT,
        {
          cause: (errorOrMessage as QueryFailedErrors).sqlMessage,
        },
      );
    } else {
      if (typeof errorOrMessage === 'string' && details === undefined) {
        throw new HttpException(errorOrMessage, HttpStatus.CONFLICT, {
          cause: messageOrDetails,
        });
      } else {
        throw new HttpException(
          messageOrDetails || errorOrMessage.code,
          HttpStatus.CONFLICT,
          {
            cause: details,
          },
        );
      }
    }
  }
}

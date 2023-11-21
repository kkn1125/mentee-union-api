import { QueryFailedError } from 'typeorm';

/* DB 에러 처리 위한 인터페이스 */
interface Custom {
  code: string;
  sqlMessage: string;
}

export interface QueryFailedErrors extends QueryFailedError, Custom {}

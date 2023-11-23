import { JwtDto } from '@/auth/jwt.strategy';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

/* DB 에러 처리 위한 인터페이스 */
interface Custom {
  code: string;
  sqlMessage: string;
}

export declare global {
  namespace Express {
    interface User extends JwtDto {}
  }

  interface QueryFailedErrors extends QueryFailedError, Custom {}
  interface EntityNotFoundErrors extends EntityNotFoundError, Custom {}
}

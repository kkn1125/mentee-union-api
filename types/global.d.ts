import { JwtDto } from '@/auth/jwt.strategy';
import { ChannelTokenDto } from '@/auth/local-channel-auth.guard';
import { Socket } from 'socket.io';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
// import { Socket } from 'socket.io';

/* DB 에러 처리 위한 인터페이스 */
interface Custom {
  code: string;
  sqlMessage: string;
}

export declare global {
  interface CustomSocket extends Socket {
    user: JwtDto;
  }
  namespace Express {
    interface User extends JwtDto {}
    interface Request {
      channels: ChannelTokenDto;
    }
  }

  interface QueryFailedErrors extends QueryFailedError, Custom {}
  interface EntityNotFoundErrors extends EntityNotFoundError, Custom {}

  type MockRepository<T = any> = Record<keyof Repository<T>, jest.Mock>;
}

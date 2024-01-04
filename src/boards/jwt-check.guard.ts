import { LoggerService } from '@/logger/logger.service';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtCheckGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const token = ctx
      .getRequest()
      .headers['authorization']?.slice('Bearer '.length);

    this.loggerService.log('🛠️ authorization check', token);

    try {
      const value = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.privkey'),
      });
      this.loggerService.log('🛠️ check verified value', value);

      const req = ctx.getRequest() as Request;
      value['userId'] = value.sub;
      delete value['sub'];
      req['user'] = value;

      return true;
    } catch (error) {
      const req = ctx.getRequest() as Request;
      this.loggerService.log('🐛 check error:', error);
      // ApiResponseService.UNAUTHORIZED(error);
      delete req['user'];
      return true;
    }
  }
}

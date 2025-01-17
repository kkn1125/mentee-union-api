import { ApiResponseService } from '@/api-response/api-response.service';
import { LoggerService } from '@/logger/logger.service';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Socket } from 'socket.io';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const ws = context.switchToWs();
    this.loggerService.log('socket check', ws.getClient());
    this.loggerService.debug(ws.getClient().name);
    if (ws.getClient() instanceof Socket) {
      const token = ws.getClient().handshake.auth.token;
      this.loggerService.log('🛠️ authorization check', token);

      if (!token) ApiResponseService.UNAUTHORIZED('no token');

      try {
        const value = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('jwt.privkey'),
        });
        this.loggerService.log(
          '🛠️ socket check verified value',
          JSON.stringify(value, null, 2),
        );
        const req = ws.getClient() as Request;
        value['userId'] = value.sub;
        delete value['sub'];
        req['user'] = value;

        return true;
      } catch (error) {
        this.loggerService.log('🐛 check error:', error);
        ApiResponseService.UNAUTHORIZED(error);
      }
    } else {
      const token =
        ctx.getRequest().headers?.['authorization']?.slice('Bearer '.length) ||
        ws.getClient().handshake.auth.token;

      this.loggerService.log('🛠️ api authorization check', token);

      if (!token) ApiResponseService.UNAUTHORIZED('no token');

      try {
        const value = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('jwt.privkey'),
        });
        this.loggerService.log(
          '🛠️ check verified value',
          JSON.stringify(value, null, 2),
        );

        const req = ctx.getRequest() as Request;
        value['userId'] = value.sub;
        delete value['sub'];
        req['user'] = value;

        return true;
      } catch (error) {
        this.loggerService.log('🐛 check error:', error);
        ApiResponseService.UNAUTHORIZED(error);
      }
    }
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    this.loggerService.log(err, user, info);
    if (err || !user) {
      throw err || ApiResponseService.UNAUTHORIZED(info.message);
    }
    return user;
  }
}

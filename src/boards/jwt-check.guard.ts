import { ApiResponseService } from '@/api-response/api-response.service';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Socket } from 'socket.io';

@Injectable()
export class JwtCheckGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const token = ctx
      .getRequest()
      .headers['authorization']?.slice('Bearer '.length);

    console.log('🛠️ authorization check', token);

    // if (!token) ApiResponseService.UNAUTHORIZED('no token');

    try {
      const value = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.privkey'),
      });
      console.log('🛠️ check verified value', value);

      const req = ctx.getRequest() as Request;
      value['userId'] = value.sub;
      delete value['sub'];
      req['user'] = value;

      return true;
    } catch (error) {
      const req = ctx.getRequest() as Request;
      console.log('🐛 check error:', error);
      // ApiResponseService.UNAUTHORIZED(error);
      delete req['user'];
      return true;
    }
  }

  // handleRequest(err, user, info) {
  //   // You can throw an exception based on either "info" or "err" arguments
  //   console.log(err, user, info);
  //   if (err || !user) {
  //     throw err || ApiResponseService.UNAUTHORIZED(info.message);
  //   }
  //   return user;
  // }
}

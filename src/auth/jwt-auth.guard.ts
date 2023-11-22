import { ApiResponseService } from '@/api-response/api-response.service';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // const ctx = context.switchToHttp();
    // const token = ctx
    //   .getRequest()
    //   .headers['authorization'].slice('Bearer '.length);

    // const value = this.jwtService.verifyAsync(token, {
    //   secret: this.configService.get<string>('jwt.secret'),
    // });

    // console.log('value', value);
    // this.auth;

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    console.log(err, user, info);
    if (err || !user) {
      throw err || ApiResponseService.UNAUTHORIZED(info.message);
    }
    return user;
  }
}

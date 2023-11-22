import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ApiResponseService } from '@/api-response/api-response.service';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    /* username field change from "username" to "email" */
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.signIn(email, password);
    if (!user) {
      ApiResponseService.UNAUTHORIZED('unauthorized exception.');
    }
    return user;
  }
}

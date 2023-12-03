import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// import { Strategy } from 'passport-local';

export interface JwtDto {
  userId: number;
  username: string;
  email: string;
  phone_number: string;
  last_sign_in: Date;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('jwt.privkey'),
    });
  }

  validate(payload: any) {
    /* timezone 맞추기 */
    const lastSignInDateWithTimezon = new Date(payload.last_sign_in);
    lastSignInDateWithTimezon.setHours(
      lastSignInDateWithTimezon.getHours() + 9,
    );
    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      phone_number: payload.phone_number,
      last_sign_in: lastSignInDateWithTimezon,
    };
  }
}

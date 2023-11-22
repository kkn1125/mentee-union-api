import { ApiResponseService } from '@/api-response/api-response.service';
import { User } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
  private readonly TRY_SIGN_IN_FAIL_LIMIT_COUNT = 5;
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // async validateUser(username: string, pass: string): Promise<any> {
  //   const user = await this.usersService.findOneByUsername(username);
  //   if (user && user.password === pass) {
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   return null;
  // }

  async signIn(email: string, password: string) {
    // const userRepository = this.usersService.getRepository();
    const user = await this.usersService.findOneByEmail(email);

    const userQr = this.userRepository.manager.connection.createQueryRunner();

    console.log(user);

    if (user === null) {
      // not found exception
      ApiResponseService.NOT_FOUND('user not found');
    }

    const comparedPassword = this.usersService.comparePassword(
      user.password,
      email,
      password,
    );

    /* 로그인 실패 초과 시 */
    if (user.fail_login_count > this.TRY_SIGN_IN_FAIL_LIMIT_COUNT) {
      ApiResponseService.BAD_REQUEST(
        'You have exceeded the maximum number of login attempts. Please try again later.',
      );
    } else {
      await userQr.startTransaction();
      /* 회원 정보 일치 시 */
      if (comparedPassword === false) {
        const triedCount = user.fail_login_count + 1;
        const result = await this.usersService.update(user.id, {
          fail_login_count: triedCount,
        });

        await userQr.commitTransaction();
        await userQr.release();

        if (result === null) {
          ApiResponseService.BAD_REQUEST('fail update user info.');
        }
        ApiResponseService.BAD_REQUEST(
          'Incorrect email or password. You have n attempts left. Please try again.',
          this.TRY_SIGN_IN_FAIL_LIMIT_COUNT - triedCount,
        );
      } else {
        const payload = {
          sub: user.id,
          username: user.username,
          email: user.email,
          phone_number: user.phone_number,
          // role: user.role,
          last_sign_in: user.last_login_at,
        };

        const result = await this.usersService.update(user.id, {
          status: 'login',
          fail_login_count: 0,
          last_login_at: new Date(),
        });

        await userQr.commitTransaction();
        await userQr.release();

        if (result === null) {
          ApiResponseService.BAD_REQUEST('fail update user info.');
        }

        const accessToken = await this.jwtService.signAsync(payload, {
          expiresIn: '30m',
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
          expiresIn: '1h',
        });

        if (user !== null) {
          delete user['password'];
        }

        return {
          user,
          access_token: accessToken,
          refresh_token: refreshToken,
        };
      }
    }
  }

  async signOut(token: string) {
    const qr = this.userRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();
    try {
      const verified = this.jwtService.verify(token, {
        ignoreNotBefore: true,
        secret: this.configService.get<string>('jwt.privkey'),
      });

      if (verified) {
        await this.userRepository.update(verified.userId, {
          status: 'logout',
        });
      }
      await qr.commitTransaction();
      await qr.release();

      return verified;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.UNAUTHORIZED('token invalid');
    }
  }
}

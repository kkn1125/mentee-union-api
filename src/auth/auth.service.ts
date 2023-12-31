import { ApiResponseService } from '@/api-response/api-response.service';
import { LoggerService } from '@/logger/logger.service';
import { MailerService } from '@/mailer/mailer.service';
import { User } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as cryptoJS from 'crypto-js';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
  private readonly TRY_SIGN_IN_FAIL_LIMIT_COUNT = 10;
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly loggerService: LoggerService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);

    const userQr = this.userRepository.manager.connection.createQueryRunner();

    if (user === null) {
      // not found exception
      ApiResponseService.NOT_FOUND('user not found');
    }

    if (!user.auth_email) {
      // not found exception
      ApiResponseService.BAD_REQUEST('email authentication required');
    }

    const comparedPassword = this.usersService.comparePassword(
      user.password,
      email,
      password,
    );

    /* 로그인 실패 초과 시 */
    if (user.fail_login_count >= this.TRY_SIGN_IN_FAIL_LIMIT_COUNT) {
      await this.mailerService.sendNoticeFailedSignin(user.email);
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

  async refreshSign(email: string) {
    const userQr = this.userRepository.manager.connection.createQueryRunner();

    await userQr.startTransaction();

    try {
      const user = await this.usersService.findOneByEmail(email);

      const payload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
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
    } catch (error) {
      await userQr.rollbackTransaction();
      await userQr.release();
      ApiResponseService.BAD_REQUEST(error, 'bad request');
    }
  }

  async updatePassword(email: string, newPassword: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      const encryptedNewPassword = this.usersService.encodingPassword(
        email,
        newPassword,
      );
      await this.usersService.update(user.id, {
        password: encryptedNewPassword,
      });
    }
  }

  checkUser(user_id: number) {
    return this.userRepository.findOneOrFail({ where: { id: user_id } });
  }

  provideSocketToken() {
    return cryptoJS
      .HmacSHA256('channel-socket-server', 'devkimson-sockete-server-provkey')
      .toString();
  }

  verifySocketToken(socketToken: string) {
    return socketToken === this.provideSocketToken();
  }

  async signOut(id: number) {
    const qr = this.userRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();
    try {
      await this.userRepository.update(+id, {
        status: 'logout',
      });
      await qr.commitTransaction();
      await qr.release();

      return true;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.UNAUTHORIZED('token invalid');
    }
  }
}

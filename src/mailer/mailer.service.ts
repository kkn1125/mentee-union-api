import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as cryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import { MailerConfig } from '@/config/mailer.config';
import { UsersService } from '@/users/users.service';
import { ApiResponseService } from '@/api-response/api-response.service';

type Id = {
  id: number;
};

type CheckMailType = {
  email: string;
  token: string;
  time: number;
  resolver: (value: string) => void;
  rejecter: (reason: any) => void;
  used: boolean;
};

const checkMailMap = new Map<string, CheckMailType>();
const resetMailMap = new Map<
  string,
  Omit<CheckMailType, 'resolver' | 'rejecter'> & { id: number }
>();

@Injectable()
export class MailerService {
  private readonly EXPIRED_TIME: number = 1000 * 60;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  getTransforter() {
    const mailerConf = this.configService.get<MailerConfig>('mailer');

    const transforter = nodemailer.createTransport({
      host: mailerConf.smtp,
      port: +mailerConf.smtpPort,
      auth: {
        user: mailerConf.smtpId,
        pass: mailerConf.smtpPw,
      },
      secure: false,
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
    });
    return transforter;
  }

  async sendMailTo(to: string, checkMailLink: string) {
    const mailerConf = this.configService.get<MailerConfig>('mailer');
    const transforter = this.getTransforter();

    const result = await transforter.sendMail({
      from: `${mailerConf.smtpFromName} <${mailerConf.smtpFromEmail}>`,
      to: `${to}`,
      subject: '본인인증 메일',
      // text: '헬로 월드?',
      html: `
          <h3>본인에 의한 메일 발송이 아니라면 아래 문의처로 연락주세요.</h3>
          <div>
            <a href="${checkMailLink}">여기를 클릭해서 본인 인증을 진행 해주세요.</a>
          </div>
          <div>
            문의처: 02-1231-1231
          </div>
        `,
    });
    console.log('send email result:', result);

    transforter.close();
  }

  async sendNoticeFailedSignin(to: string) {
    const mailerConf = this.configService.get<MailerConfig>('mailer');
    const transforter = this.getTransforter();

    const result = await transforter.sendMail({
      from: `${mailerConf.smtpFromName} <${mailerConf.smtpFromEmail}>`,
      to: `${to}`,
      subject: '로그인 시도 한도 초과 알림',
      html: `
          <h3>본인에 의한 메일 발송이 아니라면 아래 문의처로 연락주세요.</h3>
          <div>
            로그인 시도 한도를 초과했습니다. 보안을 위해 계정이 잠기며, 비밀번호를 재설정해야합니다.
          </div>
          <div>
            <a href="http://localhost:5000/auth/request-pass?r=%2F">여기를 클릭해서 비밀번호 재설정을 진행해주세요.</a>
          </div>
          <div>
            문의처: 02-1231-1231
          </div>
        `,
    });
    console.log('send email result:', result);

    transforter.close();
  }

  async sendAuthMail(email: string) {
    let resolver: (value: string) => void;
    let rejecter: (reason: any) => void;
    const promise = new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });

    const sendTime = +new Date();
    const privKey = this.configService.get<string>('mailer.smtpPrivkey');
    const token = this.makeToken(email, sendTime, privKey);
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      const checkMailLink = `http://localhost:8080/api/mailer/check?q=${encodeURIComponent(
        `tkn=${token}&e=${email}`,
      )}`;

      await this.sendMailTo(email, checkMailLink);

      checkMailMap.set(token.replace(/=+/g, ''), {
        email,
        token,
        time: sendTime,
        resolver,
        rejecter,
        used: false,
      });

      try {
        return await promise;
      } catch (error) {
        ApiResponseService.BAD_REQUEST(error, 'problem sending mail');
      }
    } else {
      ApiResponseService.CONFLICT('This email is already in use.');
    }
  }

  async sendRequestResetPassword(email: string) {
    const sendTime = +new Date();
    const privKey = this.configService.get<string>('mailer.resetPassPrivkey');
    const token = this.makeToken(email, sendTime, privKey);
    const user = await this.userService.findOneByEmail(email);
    if (user) {
      const id = user.id;

      resetMailMap.set(email, {
        id,
        email,
        token,
        time: sendTime,
        used: false,
      });

      const checkMailLink = `http://localhost:8080/api/mailer/reset-direction?q=${encodeURIComponent(
        `type=reset&tkn=${token}&e=${email}`,
      )}`;
      try {
        await this.sendMailTo(email, checkMailLink);
      } catch (error) {
        ApiResponseService.BAD_REQUEST(error, 'Invalid email');
      }
      return true;
    } else {
      ApiResponseService.NOT_FOUND(
        'This email is not registered. You must use the email that was used for registration.',
      );
    }
  }

  resetMailMapDeleteByEmail(email: string, token: string) {
    const session = resetMailMap.get(email);
    resetMailMap.delete(email);
    if (session) {
      const checkPrivkey = this.configService.get<string>(
        'mailer.checkResetPassPrivkey',
      );

      const isTimeoutToken = this.isServerProvidedToken(
        token,
        email,
        checkPrivkey,
      );
      if (!isTimeoutToken) {
        return 'token expired';
      } else if (session.token === token) {
        return 'success';
      } else {
        return 'not matched token';
      }
    } else {
      return 'no session';
    }
  }

  async redirectToResetPasswordPage(token: string, email: string) {
    const session = resetMailMap.get(email);
    if (session) {
      let clientUrl = 'http://localhost:5000/auth/reset-password';
      if (session.token === token) {
        const privKey = this.configService.get<string>(
          'mailer.resetPassPrivkey',
        );
        const isProvidedToken = this.isServerProvidedToken(
          token,
          email,
          privKey,
        );
        if (isProvidedToken) {
          console.log('redirect 맵', resetMailMap);
          resetMailMap.delete(email);
          const sendTime = +new Date();
          const checkPrivKey = this.configService.get<string>(
            'mailer.checkResetPassPrivkey',
          );
          const newToken = this.makeToken(email, sendTime, checkPrivKey);

          const user = await this.userService.findOneByEmail(email);

          if (!user) {
            ApiResponseService.NOT_FOUND('not found user');
          }

          resetMailMap.set(email, {
            id: user.id,
            email,
            token: newToken,
            time: sendTime,
            used: false,
          });

          console.log('redirect 맵 재설정 후', resetMailMap);

          clientUrl += `?q=${encodeURIComponent(`e=${email}&tkn=${newToken}`)}`;
        }
      }
      return clientUrl;
    } else {
      ApiResponseService.BAD_REQUEST('token not exists.');
    }
  }

  isServerProvidedToken(token: string, email: string, privKey: string) {
    for (let i = this.EXPIRED_TIME; i >= 0; i -= 1000) {
      const NOW = +new Date();
      const compareToken = this.makeToken(
        email,
        Math.floor(NOW / 1000) * 1000 - i,
        privKey,
      );
      if (compareToken === token) {
        console.log('token matched!');
        return compareToken;
      }
    }
    return null;
  }

  async checkEncryptMessage(queryParams: URLSearchParams, privKey: string) {
    const paramtoken = queryParams.get('tkn');
    const paramEmail = queryParams.get('e');
    const NOW = +new Date();
    const tokenInfo = checkMailMap.get(paramtoken);

    if (!tokenInfo) return 'token no exists';

    let tokenStack = null;
    let flag: string = '';
    tokenStack = this.isServerProvidedToken(paramtoken, paramEmail, privKey);

    const hasTokenInServer = checkMailMap.has(paramtoken);
    const availableToken = checkMailMap.has(tokenStack);

    const { email, token, /* time, */ resolver, rejecter } = tokenInfo;

    if (hasTokenInServer) {
      if (tokenInfo.used) {
        console.log('already used token');
        flag = 'already used';
      } else if (availableToken) {
        console.log('token is matched!');
        const user = await this.userService.findOneByEmail(email);

        if (!user) {
          console.log('available email');
          flag = 'success';
          resolver(flag);
          checkMailMap.set(token, Object.assign(tokenInfo, { used: true }));
        } else {
          flag = 'already used email';
          rejecter(flag);
        }
      } else {
        // token expired
        const { time } = tokenInfo;
        const isExpired = NOW - time > this.EXPIRED_TIME;
        if (isExpired) {
          flag = 'expired';
          rejecter(flag);
        } else {
          flag = 'invalid token format';
          rejecter(flag);
        }
      }
    } else {
      flag = 'token no exists';
      rejecter(flag);
    }

    /* initialize */
    // checkMailMap.delete(token);
    return flag;
  }

  private makeToken(email: string, sendTime: number, privKey: string) {
    return cryptoJS
      .HmacSHA256(
        'check:' +
          email +
          '|' +
          Math.floor(sendTime / 1000) * 1000 +
          '|' +
          'localhost:5000',
        privKey,
      )
      .toString();
  }
}

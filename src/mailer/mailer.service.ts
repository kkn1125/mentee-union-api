import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as cryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import { MailerConfig } from '@/config/mailer.config';
import { UsersService } from '@/users/users.service';
import { ApiResponseService } from '@/api-response/api-response.service';

type CheckMailType = {
  email: string;
  token: string;
  time: number;
  resolver: (value: string) => void;
  rejecter: (reason: any) => void;
  used: boolean;
};

const checkMailMap = new Map<string, CheckMailType>();

@Injectable()
export class MailerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  async sendAuthMail(email: string) {
    let resolver: (value: string) => void;
    let rejecter: (reason: any) => void;
    const promise = new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });

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

    const sendTime = +new Date();
    const token = this.makeToken(email, sendTime);

    checkMailMap.set(token.replace(/=+/g, ''), {
      email,
      token,
      time: sendTime,
      resolver,
      rejecter,
      used: false,
    });

    const checkMailLink = `http://localhost:8080/api/mailer/check?q=${encodeURIComponent(
      `tkn=${token}&e=${email}`,
    )}`;

    const result = await transforter.sendMail({
      from: `${mailerConf.smtpFromName} <${mailerConf.smtpFromEmail}>`,
      to: `${email}`,
      subject: '본인인증 메일',
      // text: '헬로 월드?',
      html: `
          <h3>본인에 의한 메일 발송이 아니라면 아래 문의처로 연락주세요.</h3>
          <div>
            <a href="${checkMailLink}">click this link.</a>
          </div>
          <div>
            문의처: 02-1231-1231
          </div>
        `,
    });

    if (result.accepted.length > 0) {
      console.log(`success send mail to ${email}`);
    } else {
      ApiResponseService.NOT_FOUND('email is not exists!', email);
    }

    transforter.close();

    try {
      return await promise;
    } catch (error) {
      ApiResponseService.BAD_REQUEST(error, 'problem sending mail');
    }
  }

  async checkEncryptMessage(queryParams: URLSearchParams) {
    const paramtoken = queryParams.get('tkn');
    const paramEmail = queryParams.get('e');
    const EXPIRED_TIME = 1000 * 30;
    const NOW = +new Date();
    const tokenInfo = checkMailMap.get(paramtoken);

    if (!tokenInfo) return 'token no exists';

    // const emailInfo = checkMailMap.get(token);
    let tokenStack = null;
    let flag: string = '';

    for (let i = EXPIRED_TIME; i >= 0; i -= 1000) {
      const compareToken = this.makeToken(
        paramEmail,
        Math.floor(NOW / 1000) * 1000 - i,
      );
      if (compareToken === paramtoken) {
        console.log('token matched!');
        tokenStack = compareToken;
        break;
      }
    }
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

        if (user) {
          console.log('found user!');
          flag = 'success';
          resolver(flag);
          checkMailMap.set(token, Object.assign(tokenInfo, { used: true }));
        } else {
          flag = 'not found user';
          rejecter(flag);
        }
      } else {
        // token expired
        const { time } = tokenInfo;
        const isExpired = NOW - time > EXPIRED_TIME;
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

  private makeToken(email: string, sendTime: number) {
    return cryptoJS
      .HmacSHA256(
        'check:' +
          email +
          '|' +
          Math.floor(sendTime / 1000) * 1000 +
          '|' +
          'localhost:5000',
        this.configService.get<string>('mailer.smtpPrivkey'),
      )
      .toString();
  }
}

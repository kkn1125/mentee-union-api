import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { MailerPage } from './mailer.page';
import { MailerService } from './mailer.service';
import { ApiResponseService } from '@/api-response/api-response.service';
import { UsersService } from '@/users/users.service';
import { ConfigService } from '@nestjs/config';

@Controller('mailer')
export class MailerController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly mailerPage: MailerPage,
  ) {}

  @Get('confirm')
  sendMail(@Query('email') email: string) {
    return this.mailerService.sendAuthMail(email);
  }

  // 2023-11-30 22:56:54 위 메일 검증은 이미 있는 이메일에 대해 거절
  // 때문에 비밀번호 재설정 검증 메일은 반대로 있는 사람에게만 전송하도록 해야함.
  @Post('reset')
  async requestResetPasswordAsEmailAuthentication(
    @Body('email') email: string,
  ) {
    if (email) {
      await this.mailerService.sendRequestResetPassword(email);
      ApiResponseService.SUCCESS('success send mail');
    } else {
      ApiResponseService.BAD_REQUEST('invalid request data');
    }
  }

  @Get('reset-direction')
  async resetDirection(@Res() res: Response, @Query('q') q: string) {
    const url = decodeURIComponent(q);
    const decodedUrl = new URLSearchParams(url);
    const token = decodedUrl.get('tkn');
    const email = decodedUrl.get('e');
    const type = decodedUrl.get('type');

    /* parameter 검증 */
    if (!email || !type || !token) {
      ApiResponseService.BAD_REQUEST('access denied.', 'wrong parameter');
    } else {
      if (type === 'reset') {
        const redirectionUrl =
          await this.mailerService.redirectToResetPasswordPage(token, email);
        return res.redirect(HttpStatus.PERMANENT_REDIRECT, redirectionUrl);
      } else {
        ApiResponseService.BAD_REQUEST('access denied.');
      }
    }
  }

  @Get('check')
  async checkEncryptMessage(
    @Res({ passthrough: true }) res: Response,
    @Query('q') q: string,
  ) {
    const tokenQuery = decodeURIComponent(q);
    const tokenParams = new URLSearchParams(tokenQuery);
    if (tokenQuery && tokenParams) {
      const privKey = this.configService.get<string>('mailer.smtpPrivkey');
      res.contentType('text/html');
      const isCheckSuccessed = await this.mailerService.checkEncryptMessage(
        tokenParams,
        privKey,
      );
      res.send(this.mailerPage.output(isCheckSuccessed));
    } else {
      ApiResponseService.BAD_REQUEST('wrong request');
    }
  }
}

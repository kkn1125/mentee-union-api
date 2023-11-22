import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { MailerPage } from './mailer.page';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly mailerPage: MailerPage,
  ) {}

  @Get('confirm')
  sendMail(@Query('email') email: string) {
    return this.mailerService.sendAuthMail(email);
  }

  @Get('check')
  async checkEncryptMessage(@Res() res: Response, @Query('q') q: string) {
    const tokenQuery = decodeURIComponent(q);
    const tokenParams = new URLSearchParams(tokenQuery);
    res.contentType('text/html');
    const isCheckSuccessed =
      await this.mailerService.checkEncryptMessage(tokenParams);
    res.send(this.mailerPage.output(isCheckSuccessed));
  }
}

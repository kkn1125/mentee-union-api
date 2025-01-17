import { registerAs } from '@nestjs/config';

export default registerAs('mailer', () => ({
  smtp: process.env.SMTP,
  smtpId: process.env.SMTP_ID,
  smtpPw: process.env.SMTP_PW,
  smtpSsl: process.env.SMTP_SSL,
  smtpPort: +process.env.SMTP_PORT,
  smtpFromName: process.env.SMTP_FROM_NAME,
  smtpFromEmail: process.env.SMTP_FROM_EMAIL,
  smtpPrivkey: process.env.SMTP_PRIVKEY,
  resetPassPrivkey: process.env.RESET_PASS_PRIVKEY,
  checkResetPassPrivkey: process.env.CHECK_RESET_PASS_PRIVKEY,
  clientPath: process.env.CLIENT_PATH,
  apiPath: process.env.API_PATH,
}));

export type MailerConfig = {
  smtp: string;
  smtpId: string;
  smtpPw: string;
  smtpSsl: string;
  smtpPort: number;
  smtpFromName: string;
  smtpFromEmail: string;
  smtpPrivkey: string;
  resetPassPrivkey: string;
  checkResetPassPrivkey: string;
  clientPath: string;
  apiPath: string;
};

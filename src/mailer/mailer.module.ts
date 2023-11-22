import mailerConfig from '@/config/mailer.config';
import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerController } from './mailer.controller';
import { MailerPage } from './mailer.page';
import { MailerService } from './mailer.service';

@Module({
  imports: [ConfigModule.forFeature(mailerConfig), UsersModule],
  controllers: [MailerController],
  providers: [MailerService, MailerPage],
})
export class MailerModule {}

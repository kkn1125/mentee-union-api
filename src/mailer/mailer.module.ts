import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { ConfigModule } from '@nestjs/config';
import mailerConfig from '@/config/mailer.config';
import { UsersService } from '@/users/users.service';
import { MailerPage } from './mailer.page';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { UserRecommend } from '@/users/entities/user-recommend.entity';

@Module({
  imports: [
    ConfigModule.forFeature(mailerConfig),
    TypeOrmModule.forFeature([User, UserRecommend]),
  ],
  controllers: [MailerController],
  providers: [MailerService, UsersService, MailerPage],
})
export class MailerModule {}

import { ApiResponseModule } from '@/api-response/api-response.module';
import encodeConfig from '@/config/encode.config';
import { LoggerModule } from '@/logger/logger.module';
import { MailerService } from '@/mailer/mailer.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { UserRecommend } from './entities/user-recommend.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRecommend, Profile]),
    ConfigModule.forFeature(encodeConfig),
    ApiResponseModule,
    LoggerModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, MailerService],
  exports: [UsersService],
})
export class UsersModule {}

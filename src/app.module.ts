import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import serverConfig from './config/server.config';
import { DatabaseModule } from './database/database.module';
import { ForumsModule } from './forums/forums.module';
import { MentoringModule } from './mentoring/mentoring.module';
import { ResourcesModule } from './resources/resources.module';
import { SeminarsModule } from './seminars/seminars.module';
import { UsersModule } from './users/users.module';
import { LoggerModule } from './logger/logger.module';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [serverConfig],
    }),
    HttpModule.register({}),
    DatabaseModule,
    UsersModule,
    MentoringModule,
    SeminarsModule,
    ResourcesModule,
    DatabaseModule,
    ForumsModule,
    LoggerModule,
    AuthModule,
    MailerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

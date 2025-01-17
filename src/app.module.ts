import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import serverConfig from './config/server.config';
import { DatabaseModule } from './database/database.module';
import { ForumsModule } from './forums/forums.module';
import { GradesModule } from './grades/grades.module';
import { LoggerModule } from './logger/logger.module';
import { MailerModule } from './mailer/mailer.module';
import { MentoringSessionModule } from './mentoring-session/mentoring-session.module';
import { MentoringModule } from './mentoring/mentoring.module';
import { ResourcesModule } from './resources/resources.module';
import { SeminarsModule } from './seminars/seminars.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { TasksService } from './tasks/tasks.service';
// import { ScheduleModule } from '@nestjs/schedule';
import { BoardsModule } from './boards/boards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [serverConfig],
    }),
    HttpModule.register({}),
    // ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    MentoringModule,
    SeminarsModule,
    ResourcesModule,
    ForumsModule,
    LoggerModule,
    AuthModule,
    MailerModule,
    GradesModule,
    MentoringSessionModule,
    CategoriesModule,
    MessagesModule,
    BoardsModule,
  ],
  controllers: [],
  providers: [TasksService],
})
export class AppModule {}

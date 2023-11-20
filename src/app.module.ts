import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import serverConfig from './config/server.config';
import { DatabaseModule } from './database/database.module';
import { ForumsModule } from './forums/forums.module';
import { MentoringModule } from './mentoring/mentoring.module';
import { ResourcesModule } from './resources/resources.module';
import { SeminarsModule } from './seminars/seminars.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [serverConfig],
    }),
    DatabaseModule,
    UsersModule,
    MentoringModule,
    SeminarsModule,
    ResourcesModule,
    DatabaseModule,
    ForumsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
// import { AppController } from './[x]app.controller';
// import { AppService } from './[x]app.service';
import { UsersModule } from './users/users.module';
import { MentoringModule } from './mentoring/mentoring.module';
import { ForumModule } from './forum/forum.module';
import { SeminarsModule } from './seminars/seminars.module';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    UsersModule,
    MentoringModule,
    ForumModule,
    SeminarsModule,
    ResourcesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

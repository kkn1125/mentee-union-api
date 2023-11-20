import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ApiResponseModule } from 'src/api-response/api-response.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ApiResponseModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

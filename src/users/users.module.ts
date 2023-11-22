import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ApiResponseModule } from '@/api-response/api-response.module';
import { LoggerModule } from '@/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import encodeConfig from '@/config/encode.config';
import { UserRecommend } from './entities/user-recommend.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRecommend]),
    ConfigModule.forFeature(encodeConfig),
    ApiResponseModule,
    LoggerModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelGateway } from './channel.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Channel])],
  providers: [ChannelGateway, ChannelService],
})
export class ChannelModule {}

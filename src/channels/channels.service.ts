import { Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponseService } from '@/api-response/api-response.service';
import * as cryptoJS from 'crypto-js';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly ChannelRepository: Repository<Channel>,
  ) {}

  findAll() {
    return this.ChannelRepository.find();
  }

  async findOne(id: number) {
    try {
      return await this.ChannelRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, `not found channel ${id}`);
    }
  }

  async create(createMentoringDto: CreateChannelDto) {
    const qr = this.ChannelRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const dto = await this.ChannelRepository.save(createMentoringDto);
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail create channel');
    }
  }

  async update(id: number, updateMentoringDto: UpdateChannelDto) {
    const qr = this.ChannelRepository.manager.connection.createQueryRunner();
    await this.findOne(id);

    await qr.startTransaction();
    try {
      const dto = await this.ChannelRepository.update(id, updateMentoringDto);
      await qr.commitTransaction();
      await qr.release();
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail update channel');
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.ChannelRepository.softDelete({ id });
  }

  async restore(id: number) {
    await this.findOne(id);
    return this.ChannelRepository.restore({ id });
  }

  // createChannel() {
  //   // channel create logics...
  // }

  provideToken() {
    return cryptoJS
      .HmacSHA256('channel-socket-server', 'devkimson-sockete-server-provkey')
      .toString();
  }

  verifyToken(socketToken: string) {
    return socketToken === this.provideToken();
  }
}

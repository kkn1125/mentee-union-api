import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { ApiResponseService } from '@/api-response/api-response.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  findAll() {
    return this.messagesRepository.find();
  }

  findAllByUserId(user_id: number) {
    return this.messagesRepository.find({
      where: { user_id },
      relations: {
        user: true,
        mentoringSession: true,
      },
    });
  }

  async findOne(id: number) {
    try {
      return await this.messagesRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, `not found messages ${id}`);
    }
  }

  async findMessagesInSession(mentoring_session_id: number) {
    try {
      return await this.messagesRepository.find({
        where: {
          mentoring_session_id,
        },
      });
    } catch (error) {}
  }

  async create(createMessageDto: CreateMessageDto) {
    const qr = this.messagesRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const dto = await this.messagesRepository.save(createMessageDto);
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail create messages');
    }
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    const qr = this.messagesRepository.manager.connection.createQueryRunner();
    await this.findOne(id);

    await qr.startTransaction();
    try {
      const dto = await this.messagesRepository.update(id, updateMessageDto);
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail update messages');
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.messagesRepository.softDelete({ id });
  }

  async restore(id: number) {
    await this.findOne(id);
    return this.messagesRepository.restore({ id });
  }

  // async updateStatus(id: number, status: string) {
  //   await this.findOne(id);
  //   return this.messagesRepository.update(id, { status });
  // }
}

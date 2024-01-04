import { ApiResponseService } from '@/api-response/api-response.service';
import { LoggerService } from '@/logger/logger.service';
import { MentoringSession } from '@/mentoring-session/entities/mentoring-session.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { ReadMessage } from './entities/read-message.entity';

@Injectable()
export class MessagesService {
  constructor(
    private readonly loggerService: LoggerService,
    @InjectRepository(MentoringSession)
    private readonly mentoringSessionRepository: Repository<MentoringSession>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(ReadMessage)
    private readonly readMessageRepository: Repository<ReadMessage>,
  ) {}

  findAll() {
    return this.messagesRepository.find();
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

  async readMessage(user_id: number, message_id: number) {
    const qr =
      this.readMessageRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();
    try {
      const dto = this.readMessageRepository.save({ user_id, message_id });
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'bad request in readMessage');
    }
  }

  async readSystemsMessage(session_id: number, message_id: number) {
    const session = await this.mentoringSessionRepository.findOne({
      where: { id: session_id },
      relations: {
        mentorings: {
          user: true,
        },
        messages: true,
      },
    });
    const qr =
      this.readMessageRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();
    try {
      const dtos = await Promise.all(
        session.mentorings.map((mentoring) =>
          this.readMessageRepository.save(
            {
              user_id: mentoring.mentee_id,
              message_id,
            },
            { transaction: true },
          ),
        ),
      );
      // for (const mentoring of session.mentorings) {
      //   const dto = this.readMessageRepository.save({ user_id, message_id });
      // }
      await qr.commitTransaction();
      await qr.release();
      return dtos;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'bad request in readMessage');
    }
  }

  async findSessionsHaveNotReadedMessages(user_id: number, session_id: number) {
    const session = await this.mentoringSessionRepository.findOne({
      where: {
        id: session_id,
      },
      relations: {
        messages: {
          readedUsers: true,
        },
      },
    });
    return session.messages.filter((message) =>
      message.readedUsers.every((readed) => readed.user_id !== user_id),
    );
  }

  async readSessionsMessage(user_id: number, session_id: number) {
    const qr =
      this.readMessageRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const notReadedMessages = await this.findSessionsHaveNotReadedMessages(
        user_id,
        session_id,
      );
      const readedUsers = notReadedMessages.map((message) => {
        const readMessage = new ReadMessage();
        readMessage.user_id = user_id;
        readMessage.message_id = message.id;
        return readMessage;
      });
      let dto: ReadMessage[] = [];
      if (notReadedMessages.length > 0) {
        this.loggerService.log(
          'notReadedMessages length',
          notReadedMessages.length,
        );
        dto = await this.readMessageRepository.save(readedUsers, {
          transaction: true,
        });
      } else {
        this.loggerService.log('all readed');
      }
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      this.loggerService.log('error', error);
      ApiResponseService.BAD_REQUEST(
        error,
        'bad request in readMessage sessions',
      );
    }
  }

  async create(createMessageDto: CreateMessageDto) {
    this.loggerService.log('check createMessageDto', createMessageDto);
    const qr = this.messagesRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();
    this.loggerService.log('check createMessageDto', createMessageDto);
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

  // async saveMessage(saveReadMessageDto: SaveReadMessageDto) {
  //   const qr =
  //     this.readMessageRepository.manager.connection.createQueryRunner();

  //   await qr.startTransaction();

  //   try {
  //     const dto = await this.readMessageRepository.save(saveReadMessageDto);
  //     await qr.commitTransaction();
  //     await qr.release();
  //     return dto;
  //   } catch (error) {
  //     await qr.rollbackTransaction();
  //     await qr.release();
  //     ApiResponseService.BAD_REQUEST(error, 'fail create messages');
  //   }
  // }

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

  async softRemove(message_id: number) {
    await this.findOne(message_id);
    return this.messagesRepository.update(message_id, {
      is_deleted: true,
    });
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

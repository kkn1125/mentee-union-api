import { ApiResponseService } from '@/api-response/api-response.service';
import { LoggerService } from '@/logger/logger.service';
import { Mentoring } from '@/mentoring/entities/mentoring.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CreateMentoringSessionDto } from './dto/create-mentoring-session.dto';
import { UpdateMentoringSessionDto } from './dto/update-mentoring-session.dto';
import { MentoringSession } from './entities/mentoring-session.entity';

@Injectable()
export class MentoringSessionGatewayService {
  constructor(
    private readonly loggerService: LoggerService,
    @InjectRepository(MentoringSession)
    private readonly mentoringSessionRepository: Repository<MentoringSession>,
    @InjectRepository(Mentoring)
    private readonly mentoringRepository: Repository<Mentoring>,
  ) {}

  findAll() {
    return this.mentoringSessionRepository.find({
      relations: {
        mentorings: { user: { profiles: true } },
        messages: { user: { profiles: true }, readedUsers: true },
        category: true,
      },
      order: {
        messages: {
          id: 'asc',
        },
      },
    });
  }

  updateStausByUserId(user_id: number, status: string = 'waitlist') {
    return this.mentoringRepository.update(
      { mentee_id: user_id },
      { status: status },
    );
  }

  findAllByUser(user_id: number) {
    return this.mentoringSessionRepository.find({
      where: { mentorings: { mentee_id: user_id } },
      relations: {
        mentorings: { user: { profiles: true } },
        messages: { user: { profiles: true }, readedUsers: true },
        category: true,
      },
      order: {
        messages: {
          id: 'asc',
        },
      },
    });
  }

  findAllNotReadByUserId(user_id: number) {
    return this.mentoringSessionRepository.find({
      where: {
        messages: {
          readedUsers: {
            user_id: Not(In([user_id])),
          },
        },
      },
      relations: {
        mentorings: { user: { profiles: true } },
        messages: { user: { profiles: true }, readedUsers: true },
        category: true,
      },
      order: {
        messages: {
          id: 'asc',
        },
      },
    });
  }

  findEnteredMentees(session_id: number) {
    return this.mentoringRepository.find({
      where: {
        mentoring_session_id: session_id,
        status: 'enter',
      },
    });
  }

  async findOne(id: number) {
    try {
      return await this.mentoringSessionRepository.findOneOrFail({
        where: { id },
        relations: {
          mentorings: { user: { profiles: true } },
          messages: { user: { profiles: true }, readedUsers: true },
          category: true,
        },
        order: {
          messages: {
            id: 'asc',
          },
        },
      });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, `not found mentoring session ${id}`);
    }
  }

  async updateStatus(
    user_id: number,
    session_id: number,
    status: string = 'waitlist',
  ) {
    const mentoring = await this.mentoringRepository.findOne({
      where: { mentoring_session_id: session_id, mentee_id: user_id },
    });
    const qr = this.mentoringRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();
    try {
      mentoring.status = status;
      const dto = await mentoring.save({ transaction: true });
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
    }
  }

  async out(session_id: number, user_id: number) {
    const mentoring = await this.mentoringRepository.findOne({
      where: {
        mentoring_session_id: session_id,
        mentee_id: user_id,
      },
      relations: {
        mentoringSession: {
          mentorings: { user: { profiles: true } },
          messages: { user: { profiles: true }, readedUsers: true },
          category: true,
        },
      },
    });
    const qr = this.mentoringRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();
    try {
      mentoring.status = 'waitlist';
      const dto = await mentoring.save({ transaction: true });
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
    }
  }

  async createRoom(createMentoringSessionDto: CreateMentoringSessionDto) {
    const qr =
      this.mentoringSessionRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const dto = await this.mentoringSessionRepository.save(
        createMentoringSessionDto,
        {
          transaction: true,
        },
      );

      this.loggerService.log('mentoringsession dto', dto);
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      this.loggerService.log('mentoring-session create error', error);
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail create mentoring session');
    }
  }

  async createMentoring(
    user_id: number,
    session_id: number,
    status: string = 'waitlist',
  ) {
    const mentoringQr =
      this.mentoringRepository.manager.connection.createQueryRunner();

    await mentoringQr.startTransaction();

    try {
      const dto = await this.mentoringRepository.save(
        {
          mentee_id: user_id,
          mentoring_session_id: session_id,
          status: status,
        },
        {
          transaction: true,
        },
      );
      await mentoringQr.commitTransaction();
      await mentoringQr.release();

      return dto;
    } catch (error) {
      this.loggerService.log('mentoring create error', error);
      await mentoringQr.rollbackTransaction();
      await mentoringQr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail create mentoring');
    }
  }

  async update(id: number, updateMentoringDto: UpdateMentoringSessionDto) {
    const qr =
      this.mentoringSessionRepository.manager.connection.createQueryRunner();
    await this.findOne(id);

    await qr.startTransaction();
    try {
      const dto = await this.mentoringSessionRepository.update(
        id,
        updateMentoringDto,
      );
      await qr.commitTransaction();
      await qr.release();
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail update mentoring session');
    }
  }

  removeMentoring(user_id: number, session_id: number) {
    return this.mentoringRepository.delete({
      mentee_id: user_id,
      mentoring_session_id: session_id,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.mentoringSessionRepository.softDelete({ id });
  }

  async restore(id: number) {
    await this.findOne(id);
    return this.mentoringSessionRepository.restore({ id });
  }
}

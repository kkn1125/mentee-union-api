import { ApiResponseService } from '@/api-response/api-response.service';
import { LoggerService } from '@/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CreateMentoringSessionDto } from './dto/create-mentoring-session.dto';
import { UpdateMentoringSessionDto } from './dto/update-mentoring-session.dto';
import { MentoringSession } from './entities/mentoring-session.entity';

@Injectable()
export class MentoringSessionService {
  constructor(
    private readonly loggerService: LoggerService,
    @InjectRepository(MentoringSession)
    private readonly mentoringSessionRepository: Repository<MentoringSession>,
  ) {}

  findAll() {
    return this.mentoringSessionRepository.find({
      relations: {
        mentorings: { user: { profiles: true } },
        messages: { user: { profiles: true }, readedUsers: true },
        category: true,
      },
    });
  }

  findAllByUser(user_id: number) {
    return this.mentoringSessionRepository.find({
      where: { mentorings: { mentee_id: user_id } },
      relations: {
        mentorings: { user: { profiles: true } },
        messages: { user: { profiles: true }, readedUsers: true },
        category: true,
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

  async create(createMentoringSessionDto: CreateMentoringSessionDto) {
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
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail create mentoring session');
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

  async remove(id: number) {
    await this.findOne(id);
    return this.mentoringSessionRepository.softDelete({ id });
  }

  async restore(id: number) {
    await this.findOne(id);
    return this.mentoringSessionRepository.restore({ id });
  }
}

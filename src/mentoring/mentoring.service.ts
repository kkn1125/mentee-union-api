import { Injectable } from '@nestjs/common';
import { CreateMentoringDto } from './dto/create-mentoring.dto';
import { UpdateMentoringDto } from './dto/update-mentoring.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Mentoring } from './entities/mentoring.entity';
import { Repository } from 'typeorm';
import { ApiResponseService } from '@/api-response/api-response.service';
import { MentoringSession } from '@/mentoring-session/entities/mentoring-session.entity';

@Injectable()
export class MentoringService {
  constructor(
    @InjectRepository(MentoringSession)
    private readonly mentoringSessionRepository: Repository<MentoringSession>,
    @InjectRepository(Mentoring)
    private readonly mentoringRepository: Repository<Mentoring>,
  ) {}

  findAll() {
    return this.mentoringRepository.find();
  }

  findAllByUserId(user_id: number) {
    return this.mentoringRepository.find({
      where: { mentee_id: user_id },
      relations: {
        mentoringSession: {
          mentorings: { user: { profiles: true } },
          messages: { user: { profiles: true }, readedUsers: { user: true } },
          category: true,
        },
      },
    });
  }

  async findOne(id: number) {
    try {
      return await this.mentoringRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, `not found mentoring ${id}`);
    }
  }

  async create(createMentoringDto: CreateMentoringDto) {
    const qr = this.mentoringRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const dto = await this.mentoringRepository.save(createMentoringDto);
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail create mentoring');
    }
  }

  async update(id: number, updateMentoringDto: UpdateMentoringDto) {
    const qr = this.mentoringRepository.manager.connection.createQueryRunner();
    await this.findOne(id);

    await qr.startTransaction();
    try {
      const dto = await this.mentoringRepository.update(id, updateMentoringDto);
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail update mentoring');
    }
  }

  async softRemove(id: number) {
    await this.findOne(id);
    return this.mentoringRepository.softDelete({ id });
  }

  async removeBySessionId(session_id: number, mentee_id: number) {
    try {
      const mentoring = await this.mentoringRepository.findOneOrFail({
        where: {
          mentoring_session_id: session_id,
          mentee_id,
        },
      });
      return mentoring.remove({ transaction: true });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, 'not found', [session_id, mentee_id]);
    }
  }

  async removeEmptyMentoringSession(session_id: number) {
    const session = await this.mentoringSessionRepository.findOne({
      where: { id: session_id },
      relations: {
        mentorings: true,
      },
    });
    if (session.mentorings.length === 0) {
      const qr =
        this.mentoringSessionRepository.manager.connection.createQueryRunner();
      await qr.startTransaction();
      try {
        const dto = await session.remove({ transaction: true });
        await qr.commitTransaction();
        await qr.release();
        return dto;
      } catch (error) {
        await qr.rollbackTransaction();
        await qr.release();
        ApiResponseService.BAD_REQUEST(
          error,
          'failed remove empty session',
          session.id,
        );
      }
    } else {
      return null;
    }
  }

  async restore(id: number) {
    await this.findOne(id);
    return this.mentoringRepository.restore({ id });
  }

  async updateStatus(id: number, status: string) {
    await this.findOne(id);
    return this.mentoringRepository.update(id, { status });
  }
}

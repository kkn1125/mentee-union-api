import { Injectable } from '@nestjs/common';
import { CreateMentoringDto } from './dto/create-mentoring.dto';
import { UpdateMentoringDto } from './dto/update-mentoring.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Mentoring } from './entities/mentoring.entity';
import { Repository } from 'typeorm';
import { ApiResponseService } from '@/api-response/api-response.service';

@Injectable()
export class MentoringService {
  constructor(
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
          category: true,
          mentorings: {
            user: {
              profiles: true,
            },
          },
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
      return this.mentoringRepository.softDelete({ id: mentoring.id });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, 'not found', [session_id, mentee_id]);
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

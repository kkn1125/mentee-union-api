import { ApiResponseService } from '@/api-response/api-response.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSeminarDto } from './dto/create-seminar.dto';
import { UpdateSeminarDto } from './dto/update-seminar.dto';
import { Seminar } from './entities/seminar.entity';

@Injectable()
export class SeminarsService {
  constructor(
    @InjectRepository(Seminar)
    private readonly seminarRepository: Repository<Seminar>,
  ) {}

  async create(createSeminarDto: CreateSeminarDto) {
    // return 'This action adds a new seminar';
    const qr = this.seminarRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();
    try {
      const dto = await this.seminarRepository.save(createSeminarDto);
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'seminar create was rollback.');
    }
  }

  findAll() {
    // return `This action returns all seminars`;
    return this.seminarRepository.find();
  }

  findOne(id: number) {
    // return `This action returns a #${id} seminar`;
    return this.seminarRepository.findOne({ where: { id } });
  }

  async update(id: number, updateSeminarDto: UpdateSeminarDto) {
    // return `This action updates a #${id} seminar`;
    const qr = this.seminarRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();
    try {
      const dto = await this.seminarRepository.update(id, updateSeminarDto);
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail update seminar');
    }
  }

  async softRemove(id: number) {
    // return `This action removes a #${id} seminar`;
    const qr = this.seminarRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();
    try {
      await this.seminarRepository.softDelete(id);
      await qr.commitTransaction();
      await qr.release();
      return true;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail soft remove seminar');
    }
  }
  async remove(id: number) {
    // return `This action removes a #${id} seminar`;
    const qr = this.seminarRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();
    try {
      await this.seminarRepository.softDelete(id);
      await qr.commitTransaction();
      await qr.release();
      return true;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail soft remove seminar');
    }
  }
}

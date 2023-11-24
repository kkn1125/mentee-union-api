import { Injectable } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { Repository } from 'typeorm';
import { ApiResponseService } from '@/api-response/api-response.service';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  findAll() {
    return this.gradeRepository.find();
  }

  async findOne(id: number) {
    try {
      return await this.gradeRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, `not found grade ${id}`);
    }
  }

  create(createForumDto: CreateGradeDto) {
    return this.gradeRepository.save(createForumDto);
  }

  async update(id: number, updateForumDto: UpdateGradeDto) {
    await this.findOne(id);
    return this.gradeRepository.update(id, updateForumDto);
  }

  async softDelete(id: number) {
    await this.findOne(id);
    return this.gradeRepository.softDelete({ id });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.gradeRepository.softDelete({ id });
  }

  async restore(id: number) {
    try {
      await this.gradeRepository.findOneOrFail({
        where: { id },
        withDeleted: true,
      });
      return this.gradeRepository.restore({ id });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, `not found grade ${id}`);
    }
  }
}

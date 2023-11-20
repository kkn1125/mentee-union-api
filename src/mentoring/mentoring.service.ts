import { Injectable } from '@nestjs/common';
import { CreateMentoringDto } from './dto/create-mentoring.dto';
import { UpdateMentoringDto } from './dto/update-mentoring.dto';

@Injectable()
export class MentoringService {
  create(createMentoringDto: CreateMentoringDto) {
    return 'This action adds a new mentoring';
  }

  findAll() {
    return `This action returns all mentoring`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mentoring`;
  }

  update(id: number, updateMentoringDto: UpdateMentoringDto) {
    return `This action updates a #${id} mentoring`;
  }

  remove(id: number) {
    return `This action removes a #${id} mentoring`;
  }
}

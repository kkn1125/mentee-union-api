import { Injectable } from '@nestjs/common';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { Forum } from './entities/forum.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseService } from '@/api-response/api-response.service';

@Injectable()
export class ForumsService {
  constructor(
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
  ) {}

  findAll() {
    return this.forumRepository.find({
      relations: {
        user: true,
      },
    });
  }

  async findOne(id: number) {
    try {
      return await this.forumRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, `not found forum ${id}`);
    }
  }

  create(createForumDto: CreateForumDto) {
    return this.forumRepository.save(createForumDto);
  }

  async update(id: number, updateForumDto: UpdateForumDto) {
    await this.findOne(id);
    return this.forumRepository.update(id, updateForumDto);
  }

  async softDelete(id: number) {
    await this.findOne(id);
    return this.forumRepository.softDelete({ id });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.forumRepository.softDelete({ id });
  }

  async restore(id: number) {
    try {
      await this.forumRepository.findOneOrFail({
        where: { id },
        withDeleted: true,
      });
      return this.forumRepository.restore({ id });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, `not found forum ${id}`);
    }
  }
}

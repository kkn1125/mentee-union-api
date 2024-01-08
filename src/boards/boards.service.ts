import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Brackets, Repository } from 'typeorm';
import { ApiResponseService } from '@/api-response/api-response.service';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  findAll() {
    return this.boardRepository.find({
      relations: {
        user: {
          profiles: true,
        },
      },
    });
  }

  findAllByType(type: string, user_id?: number) {
    const queryBuilder = this.boardRepository.createQueryBuilder('board');
    return queryBuilder
      .leftJoinAndSelect('board.user', 'user')
      .leftJoinAndSelect('user.profiles', 'profiles')
      .where('board.type = :type', { type })
      .andWhere(
        new Brackets((qb) => {
          qb.where('board.visible = :visible', { visible: true }).orWhere(
            'board.user_id = :user_id',
            { user_id },
          );
        }),
      )
      .getMany();
  }

  findOne(id: number) {
    return this.boardRepository.findOne({
      where: {
        id,
      },
      relations: {
        user: {
          profiles: true,
        },
      },
    });
  }

  findOneByType(id: number, type: string) {
    return this.boardRepository.findOne({
      where: {
        id,
        type,
      },
      relations: {
        user: {
          profiles: true,
        },
      },
    });
  }

  async updateViewCount(id: number) {
    const qr = this.boardRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();
    try {
      const dto = await this.boardRepository.query(
        `UPDATE board SET view_count = view_count + 1 WHERE id=?`,
        [id],
      );
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(
        error,
        'fail update view count in board',
        id,
      );
    }
  }

  create(createBoardDto: CreateBoardDto) {
    return this.boardRepository.save(createBoardDto);
  }

  update(id: number, updateBoardDto: UpdateBoardDto) {
    return this.boardRepository.update(id, updateBoardDto);
  }

  remove(id: number) {
    return this.boardRepository.delete({ id });
  }

  softRemove(id: number) {
    return this.boardRepository.softDelete({ id });
  }

  restore(id: number) {
    return this.boardRepository.restore({ id });
  }
}

import { Injectable } from '@nestjs/common';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { Forum } from './entities/forum.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseService } from '@/api-response/api-response.service';
import { User } from '@/users/entities/user.entity';
import { ForumLike } from './entities/forum-like.entity';

@Injectable()
export class ForumsService {
  constructor(
    @InjectRepository(ForumLike)
    private readonly forumLikeRepository: Repository<ForumLike>,
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      return await this.forumRepository.findOneOrFail({
        where: { id },
        relations: {
          user: { profiles: true },
          forumLikes: true,
        },
      });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, `not found forum ${id}`);
    }
  }

  create(createForumDto: CreateForumDto) {
    return this.forumRepository.save(createForumDto);
  }

  async likeForum(forum_id: number, user_id: number) {
    const user = await this.userRepository.findOne({ where: { id: user_id } });

    if (!user) {
      ApiResponseService.NOT_FOUND('not found user', user_id);
    }

    const qr = this.forumLikeRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const dto = await this.forumLikeRepository.save(
        {
          user_id,
          forum_id,
        },
        { transaction: true },
      );
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST('fail like forum', [forum_id]);
    }
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

import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GivePointsDto } from './dto/give-points.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ApiResponseService } from '@/api-response/api-response.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const qr = this.userRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const dto = await this.userRepository.save(createUserDto, {
        transaction: true,
      });
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST('user create was rollback.');
    }
  }

  findAll() {
    return this.userRepository.find({
      select: [],
    });
  }

  findOne(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  givePoints(givePointsDto: GivePointsDto) {
    givePointsDto;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    let flag = false;
    const qr = this.userRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      this.userRepository.update(id, updateUserDto);
      await qr.commitTransaction();
      flag = true;
    } catch (error) {
      await qr.rollbackTransaction();
      flag = false;
    } finally {
      await qr.release();
      return flag;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

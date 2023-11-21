import { ApiResponseService } from '@/api-response/api-response.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as cryptoJS from 'crypto-js';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { GivePointsDto } from './dto/give-points.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRecommend } from './entities/user-recommend.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRecommend)
    private readonly userRecommendRepository: Repository<UserRecommend>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const qr = this.userRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      createUserDto.password = this.encodePassword(createUserDto.password);

      const dto = await this.userRepository.save(createUserDto, {
        transaction: true,
      });
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      console.log(error);
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

  // async givePoints(givePointsDto: GivePointsDto) {
  //   const userQr = this.userRepository.manager.connection.createQueryRunner();
  //   const userRecommendQr =
  //     this.userRecommendRepository.manager.connection.createQueryRunner();

  //   const giverId = givePointsDto.giver_id;
  //   const receiverId = givePointsDto.receiver_id;
  //   const addPoints = givePointsDto.points;

  //   await userQr.startTransaction();
  //   try {
  //     const giverObj = await this.userRepository.findOne({
  //       where: { id: giverId },
  //     });
  //     const receiverObj = await this.userRepository.findOne({
  //       where: { id: receiverId },
  //     });

  //     /* giver 추천 점수 */
  //     giverObj.points += 1;
  //     await this.userRepository.save(giverObj, {
  //       transaction: true,
  //     });

  //     /* receiver 받은 점수 */
  //     receiverObj.points += +addPoints;
  //     await this.userRepository.save(receiverObj, { transaction: true });
  //     await userQr.commitTransaction();
  //     await userQr.release();
  //   } catch (error) {
  //     await userQr.rollbackTransaction();
  //     await userQr.release();
  //     ApiResponseService.BAD_REQUEST('fail save giver, receiver data');
  //   }

  //   await userRecommendQr.startTransaction();
  //   try {
  //     /* give session 저장 */
  //     await this.userRecommendRepository.save(givePointsDto, {
  //       transaction: true,
  //     });
  //     await userRecommendQr.commitTransaction();
  //     await userRecommendQr.release();
  //   } catch (error) {
  //     console.log(error);
  //     await userRecommendQr.rollbackTransaction();
  //     await userRecommendQr.release();
  //     ApiResponseService.BAD_REQUEST('fail save user recommend data');
  //   }

  //   ApiResponseService.SUCCESS('success give points to receiver');
  // }
  async givePoints(givePointsDto: GivePointsDto) {
    const userQr = this.userRepository.manager.connection.createQueryRunner();
    const userRecommendQr =
      this.userRecommendRepository.manager.connection.createQueryRunner();

    const giverId = givePointsDto.giver_id;
    const receiverId = givePointsDto.receiver_id;

    await userRecommendQr.startTransaction();
    try {
      /* give session 저장 */
      await this.userRecommendRepository.save(givePointsDto, {
        transaction: true,
      });
      await userRecommendQr.commitTransaction();
      await userRecommendQr.release();
    } catch (error) {
      console.log(error);
      await userRecommendQr.rollbackTransaction();
      await userRecommendQr.release();
      ApiResponseService.BAD_REQUEST('fail save user recommend data');
    } finally {
      /* 기버 기준 */
      const givers = await this.userRecommendRepository.find({
        where: {
          giver_id: giverId,
        },
      });
      const giversReceiver = await this.userRecommendRepository.find({
        where: {
          receiver_id: giverId,
        },
      });
      /* 리시버 기준 */
      const receiversGiver = await this.userRecommendRepository.find({
        where: {
          giver_id: receiverId,
        },
      });
      const receivers = await this.userRecommendRepository.find({
        where: {
          receiver_id: receiverId,
        },
      });

      /* 기버가 추천한 것과 받은 것 점수 합산 */
      const giversPoints = givers.reduce((acc) => (acc += 1), 0);
      const giversReceivePoints = giversReceiver.reduce(
        (acc, giverReceive) => (acc += giverReceive.points),
        0,
      );

      /* 리시버가 추천한 것과 받은 것 점수 합산 */
      const receiversPoints = receivers.reduce(
        (acc, receiver) => (acc += receiver.points),
        0,
      );
      const receiversGivePoints = receiversGiver.reduce((acc) => (acc += 1), 0);

      /* 기버의 총 점수(추천 받은 총 점수 + 추천 한 횟수 당 1점) 합산 */
      const giverTotalPoints = giversPoints + giversReceivePoints;
      /* 리시버의 총 점수(추천 받은 총 점수 + 추천 한 횟수 당 1점) 합산 */
      const receiverTotalPoints = receiversGivePoints + receiversPoints;

      await userQr.startTransaction();
      try {
        const giverObj = await this.userRepository.findOne({
          where: { id: giverId },
        });
        const receiverObj = await this.userRepository.findOne({
          where: { id: receiverId },
        });

        /* giver 추천 점수 */
        giverObj.points = +giverTotalPoints;
        await this.userRepository.save(giverObj, {
          transaction: true,
        });

        /* receiver 받은 점수 */
        receiverObj.points = +receiverTotalPoints;
        await this.userRepository.save(receiverObj, { transaction: true });
        await userQr.commitTransaction();
        await userQr.release();
      } catch (error) {
        await userQr.rollbackTransaction();
        await userQr.release();
        ApiResponseService.BAD_REQUEST('fail save giver, receiver data');
      }

      ApiResponseService.SUCCESS('success give points to receiver');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const qr = this.userRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const dto = await this.userRepository.update(id, updateUserDto);
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
    }
  }

  async remove(id: number) {
    const qr = this.userRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();

    try {
      await this.userRepository.delete(id);
      await qr.commitTransaction();
      await qr.release();
      return true;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST('user remove was rollback.');
    }
  }

  async softRemove(id: number) {
    const qr = this.userRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();

    try {
      await this.userRepository.softDelete(id);
      await qr.commitTransaction();
      await qr.release();
      return true;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST('user soft remove was rollback.');
    }
  }

  encodePassword(password: string) {
    const privkey = this.configService.get<string>('encode.privkey');
    return cryptoJS.HmacSHA256(password, privkey).toString(cryptoJS.enc.Hex);
  }
}

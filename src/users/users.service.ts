import { ApiResponseService } from '@/api-response/api-response.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as cryptoJS from 'crypto-js';
import { EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { GivePointsDto } from './dto/give-points.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRecommend } from './entities/user-recommend.entity';
import * as fs from 'fs';
import * as path from 'path';
import { Profile } from './entities/profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRecommend)
    private readonly userRecommendRepository: Repository<UserRecommend>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  getRepository() {
    return this.userRepository;
  }

  findAll() {
    return this.userRepository.find({
      select: [
        'id',
        'grade_id',
        'username',
        'email',
        'auth_email',
        'phone_number',
        'birth',
        'gender',
        'level',
        'points',
        'fail_login_count',
        'last_login_at',
        'status',
        'deleted_at',
        'created_at',
        'updated_at',
      ],
    });
  }

  async findOne(id: number) {
    try {
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, `not found user ${id}`);
    }
  }

  async findOneProfile(id: number) {
    try {
      return await this.userRepository.findOne({
        where: { id },
        select: [
          'id',
          'grade_id',
          'username',
          'email',
          'phone_number',
          'birth',
          'gender',
          'auth_email',
          'level',
          'points',
          'fail_login_count',
          'last_login_at',
          'status',
          'deleted_at',
          'created_at',
          'updated_at',
        ],
        relations: {
          seminar: true,
          seminarParticipants: true,
          givers: true,
          receivers: true,
          grade: true,
          profiles: true,
        },
      });
    } catch (error) {}
  }

  findOneByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto) {
    const qr = this.userRepository.manager.connection.createQueryRunner();

    if (!createUserDto.auth_email) {
      ApiResponseService.UNAUTHORIZED('invalid', 'required auth email');
    }

    await qr.startTransaction();

    try {
      this.userRepository.findOne({
        where: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      });

      createUserDto.password = this.encodingPassword(
        createUserDto.email,
        createUserDto.password,
      );

      const dto = await this.userRepository.save(createUserDto, {
        transaction: true,
      });
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      if (error instanceof QueryFailedError) {
        ApiResponseService.BAD_REQUEST(
          (error as QueryFailedErrors).code,
          (error as QueryFailedErrors).sqlMessage,
        );
      } else {
        ApiResponseService.BAD_REQUEST('user create was rollback.');
      }
    }
  }

  async givePoints(givePointsDto: GivePointsDto) {
    const userQr = this.userRepository.manager.connection.createQueryRunner();
    const userRecommendQr =
      this.userRecommendRepository.manager.connection.createQueryRunner();

    const giverId = +givePointsDto.giver_id;
    const receiverId = +givePointsDto.receiver_id;

    const points: number[] = [];

    // 사용자 존재 검증
    try {
      await Promise.all([
        this.userRepository.findOneOrFail({
          where: { id: giverId },
          transaction: true,
        }),
        this.userRepository.findOneOrFail({
          where: { id: receiverId },
          transaction: true,
        }),
      ]);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        ApiResponseService.NOT_FOUND('not found user', error.message);
      } else {
        ApiResponseService.BAD_REQUEST(error, 'wrong query');
      }
    }

    // /* 추천 데이터 저장 */
    try {
      await userRecommendQr.startTransaction();
      /* give session 저장 */
      await this.userRecommendRepository.save(givePointsDto, {
        transaction: true,
      });

      /* 점수 합산 조회 */
      /* set variable */
      await userRecommendQr.query(`SET @TARGET_ID=?`, [giverId]);

      /* giver 점수 조회 */
      const { giver_recommend_points, giver_received_points } =
        (
          await userRecommendQr.query(`SELECT 
          COUNT(CASE
              WHEN giver_id = @TARGET_ID THEN giver_id
          END) AS giver_recommend_points,
          SUM(CASE
              WHEN receiver_id = @TARGET_ID THEN points
          END) AS giver_received_points
      FROM
          user_recommend`)
        )[0] || {};
      points[0] = +giver_recommend_points + +giver_received_points;

      /* replace variable value */
      await userRecommendQr.query(`SET @TARGET_ID=?`, [receiverId]);

      /* receiver 점수 조회 */
      const { receiver_recommend_points, receiver_received_points } =
        (
          await userRecommendQr.query(`SELECT 
          COUNT(CASE
              WHEN giver_id = @TARGET_ID THEN giver_id
          END) AS receiver_recommend_points,
          SUM(CASE
              WHEN receiver_id = @TARGET_ID THEN points
          END) AS receiver_received_points
      FROM
          user_recommend`)
        )[0] || {};
      points[1] = +receiver_recommend_points + +receiver_received_points;

      /* initialize variable */
      await userRecommendQr.query(`SET @TARGET_ID=null`);

      await userRecommendQr.commitTransaction();
      await userRecommendQr.release();
    } catch (error) {
      await userRecommendQr.rollbackTransaction();
      await userRecommendQr.release();
    }

    /* 기버 점수 저장 */
    try {
      await userQr.startTransaction();
      await this.userRepository.update(giverId, {
        points: points[0],
      });
      await this.userRepository.update(receiverId, {
        points: points[1],
      });
      await userQr.commitTransaction();
      await userQr.release();
    } catch (error) {
      await userQr.rollbackTransaction();
      await userQr.release();
    }

    ApiResponseService.SUCCESS('success give points to receiver');
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
      await this.userRepository.softDelete({ id });
      await qr.commitTransaction();
      await qr.release();
      return true;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'user remove was rollback.');
    }
  }

  async softRemove(id: number) {
    const qr = this.userRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();

    try {
      await this.userRepository.softDelete({ id });
      await qr.commitTransaction();
      await qr.release();
      return true;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'user soft remove was rollback.');
    }
  }

  async resetPassword(email: string, password: string) {
    const qr = this.userRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();

    try {
      const user = await this.findOneByEmail(email);
      if (user) {
        const encodedPassword = this.encodingPassword(email, password);
        await this.update(user.id, {
          password: encodedPassword,
          fail_login_count: 0,
        });
        await qr.commitTransaction();
        await qr.release();
        return true;
      } else {
        await qr.commitTransaction();
        await qr.release();
        ApiResponseService.NOT_FOUND('user not found', user.id);
      }
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'user soft remove was rollback.');
    }
  }

  async updateProfile(id: number, profile: Express.Multer.File) {
    const uploadProfilePath = 'storage/upload/profile';
    try {
      fs.readdirSync(path.join(path.resolve(), uploadProfilePath));
    } catch (error) {
      fs.mkdirSync(path.join(path.resolve(), uploadProfilePath));
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      ApiResponseService.NOT_FOUND('user not found', id);
    }

    try {
      fs.writeFileSync(
        path.join(uploadProfilePath, profile.originalname),
        profile.buffer,
      );
    } catch (error) {
      ApiResponseService.BAD_REQUEST('error creating profile file');
      return;
    }

    const qr = this.userRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const newProfile = new Profile();

      newProfile.origin_name = profile.originalname;
      newProfile.new_name = '';

      if (!user.profiles) {
        user.profiles = [];
      }

      user.profiles.push(newProfile);

      await user.save();
      await qr.commitTransaction();
      await qr.release();
      return true;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST('bad request');
    }
  }

  // encodePassword(password: string) {
  //   const privkey = this.configService.get<string>('encode.privkey');
  //   return cryptoJS.HmacSHA256(password, privkey).toString(cryptoJS.enc.Hex);
  // }

  encodingPassword(email: string, password: string) {
    const encodeKey = this.configService.get<string>('encode.privkey');
    return cryptoJS.HmacSHA256(password + '|' + email, encodeKey).toString();
  }

  comparePassword(
    encodedPassword: string,
    compareEmail: string,
    comparePassword: string,
  ) {
    const compare = this.encodingPassword(compareEmail, comparePassword);

    return encodedPassword === compare;
  }

  async restoreDormantAccount(email: string) {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { email },
        withDeleted: true,
      });
      await this.userRepository.restore({ id: user.id });
      return true;
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, 'user not found');
    }
  }
}

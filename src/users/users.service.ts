import { ApiResponseService } from '@/api-response/api-response.service';
import { Grade } from '@/grades/entities/grade.entity';
import { LoggerService } from '@/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as cryptoJS from 'crypto-js';
import * as fs from 'fs';
import * as path from 'path';
import { EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { GivePointsDto } from './dto/give-points.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Profile } from './entities/profile.entity';
import { UserRecommend } from './entities/user-recommend.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  UPLOAD_PROFILE_PATH = 'storage/upload/profile';

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRecommend)
    private readonly userRecommendRepository: Repository<UserRecommend>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
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

  findOneProfile(id: number) {
    const qb = this.userRepository.createQueryBuilder('user');
    return qb
      .leftJoinAndSelect('user.profiles', 'profiles')
      .leftJoinAndSelect('user.grade', 'grade')
      .select([
        'user.id',
        'user.grade_id',
        'user.username',
        'user.email',
        'user.phone_number',
        'user.birth',
        'user.gender',
        'user.auth_email',
        'user.level',
        'user.points',
        'user.fail_login_count',
        'user.last_login_at',
        'user.status',
        'user.deleted_at',
        'user.created_at',
        'user.updated_at',
        'profiles',
        'grade',
      ])
      .where('user.id = :id', { id })
      .getOne();
  }

  findOneSeminars(id: number) {
    const qb = this.userRepository.createQueryBuilder('user');
    return qb
      .leftJoinAndSelect('user.seminars', 'seminars')
      .leftJoinAndSelect('user.seminarParticipants', 'seminarParticipants')
      .leftJoinAndSelect('seminars.user', 'serminarUser')
      .leftJoinAndSelect('seminarParticipants.seminar', 'seminar')
      .leftJoinAndSelect('seminar.category', 'category')
      .leftJoinAndSelect('seminar.user', 'seminarUser')
      .leftJoinAndSelect(
        'seminar.seminarParticipants',
        'seminarSeminarParticipants',
      )
      .select([
        'user.id',
        'seminars',
        'seminarParticipants',
        'serminarUser',
        'seminar',
        'category',
        'seminarUser',
        'seminarSeminarParticipants',
      ])
      .where('user.id = :id', { id })
      .getOne();
  }

  findOneForums(id: number) {
    const qb = this.userRepository.createQueryBuilder('user');
    return qb
      .leftJoinAndSelect('user.forums', 'forums')
      .leftJoinAndSelect('user.forumLikes', 'forumLikes')
      .leftJoinAndSelect('forumLikes.forum', 'forum')
      .leftJoinAndSelect('forumLikes.user', 'forumLikesUser')
      .select(['user.id', 'forums', 'forumLikes', 'forum', 'forumLikesUser'])
      .where('user.id = :id', { id })
      .getOne();
  }

  findOnePointSystem(id: number) {
    const qb = this.userRepository.createQueryBuilder('user');
    return qb
      .leftJoinAndSelect('user.givers', 'givers')
      .leftJoinAndSelect('user.receivers', 'receivers')
      .leftJoinAndSelect('givers.giver', 'giversUser')
      .leftJoinAndSelect('receivers.receiver', 'receiversUser')
      .select(['user.id', 'givers', 'receivers', 'giversUser', 'receiversUser'])
      .where('user.id = :id', { id })
      .getOne();
  }

  findOneMentorings(id: number) {
    const qb = this.userRepository.createQueryBuilder('user');
    return qb
      .leftJoinAndSelect('user.mentorings', 'mentorings')
      .leftJoinAndSelect('mentorings.mentoringSession', 'mentoringSession')
      .leftJoinAndSelect('mentoringSession.messages', 'messages')
      .leftJoinAndSelect('mentoringSession.category', 'category')
      .select([
        'user.id',
        'mentorings',
        'mentoringSession',
        'messages',
        'category',
      ])
      .where('user.id = :id', { id })
      .getOne();
  }

  async isPossibleUpgrade(user_id: number) {
    return !!(await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.grade', 'grade')
      .where('user.id = :user_id', { user_id })
      .andWhere('user.points >= 100 + user.level * 50')
      .getOne());
  }

  async upgradeUser(user_id: number) {
    const isUpgradeable = this.isPossibleUpgrade(user_id);

    if (!isUpgradeable) return null;

    const user = await this.userRepository.findOne({
      where: {
        id: user_id,
      },
    });
    const grades = await this.gradeRepository.find({
      order: {
        id: 'ASC',
      },
    });
    const foundUpgradeableId = grades.findIndex(
      (grade) => grade.id === user.grade_id,
    );
    const availableGradeNumber = grades[foundUpgradeableId + 1];

    if (availableGradeNumber) {
      const qr = this.userRepository.manager.connection.createQueryRunner();

      await qr.startTransaction();
      try {
        const dto = await this.userRepository.update(user.id, {
          grade_id: availableGradeNumber.id,
          level: user.level + 1,
        });
        await qr.commitTransaction();
        await qr.release();
        this.loggerService.log('check dto', dto);
      } catch (error) {
        await qr.rollbackTransaction();
        await qr.release();
        ApiResponseService.BAD_REQUEST('not available upgrade user');
      }
    }

    /* 등급 인덱스 초과 시 최고 레벨이기 때문에 현상 유지 */
    return await this.userRepository.findOne({
      where: {
        id: user_id,
      },
    });
  }

  findOneByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  getProfileImage(filename: string) {
    const file = fs.readFileSync(
      path.join(path.resolve(), this.UPLOAD_PROFILE_PATH, filename),
    );
    return file;
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

  isGiverReceiver(giver_id: number, receiver_id: number) {
    return giver_id === receiver_id;
  }

  async checkAlreadyPointGived(giver_id: number, receiver_id: number) {
    const isAlreadyGived = await this.userRecommendRepository.findOne({
      where: {
        giver_id,
        receiver_id,
      },
    });
    this.loggerService.log('isAlreadyGived', isAlreadyGived);
    this.loggerService.log('isAlreadyGived', !!isAlreadyGived);
    return !!isAlreadyGived;
  }

  async givePoints(givePointsDto: GivePointsDto) {
    const recommendedSameUser = await this.checkAlreadyPointGived(
      givePointsDto.giver_id,
      givePointsDto.receiver_id,
    );

    if (recommendedSameUser) {
      return null;
    }

    const userQr = this.userRepository.manager.connection.createQueryRunner();
    const userRecommendQr =
      this.userRecommendRepository.manager.connection.createQueryRunner();

    const giverId = +givePointsDto.giver_id;
    const receiverId = +givePointsDto.receiver_id;

    const points: number[] = [];

    /* 사용자 존재 검증 */
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

    /* 추천 데이터 저장 */
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

    return true;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (user) {
      if ('password' in updateUserDto) {
        updateUserDto.password = this.encodingPassword(
          user.email,
          updateUserDto.password,
        );
      }

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
        ApiResponseService.BAD_REQUEST(error, 'fail update user', id);
      }
    } else {
      ApiResponseService.NOT_FOUND('not found user', id);
    }
  }

  async remove(id: number) {
    const qr = this.userRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();

    try {
      await this.userRepository.delete({ id });
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
    try {
      fs.readdirSync(path.join(path.resolve(), this.UPLOAD_PROFILE_PATH));
    } catch (error) {
      fs.mkdirSync(path.join(path.resolve(), this.UPLOAD_PROFILE_PATH), {
        recursive: true,
      });
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      ApiResponseService.NOT_FOUND('user not found', id);
    }

    const filename = cryptoJS
      .HmacSHA256(
        profile.originalname + +new Date(),
        this.configService.get<string>('encode.privkey'),
      )
      .toString();

    const extend = profile.originalname.split('.')[1];
    const newFileName = filename + '.' + extend;

    try {
      fs.writeFileSync(
        path.join(this.UPLOAD_PROFILE_PATH, newFileName),
        profile.buffer,
      );
    } catch (error) {
      ApiResponseService.BAD_REQUEST('error creating profile file');
      return;
    }

    const qr = this.profileRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      await this.profileRepository.insert({
        user_id: id,
        origin_name: profile.originalname,
        new_name: newFileName,
      });
      await qr.commitTransaction();
      await qr.release();
      return true;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST('bad request');
    }
  }

  async deleteProfile(id: number) {
    const qr = this.profileRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const profiles = await this.profileRepository.find({
        where: { user_id: id },
      });
      for (const profile of profiles) {
        fs.rmSync(path.join(this.UPLOAD_PROFILE_PATH, profile.new_name), {
          recursive: true,
        });
        await profile.remove({ transaction: true });
      }
      qr.commitTransaction();
      qr.release();
      return true;
    } catch (error) {
      qr.rollbackTransaction();
      qr.release();
      ApiResponseService.BAD_REQUEST('bad request');
    }
  }

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

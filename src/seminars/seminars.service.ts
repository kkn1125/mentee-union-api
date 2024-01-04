import { ApiResponseService } from '@/api-response/api-response.service';
import { LoggerService } from '@/logger/logger.service';
import { UsersService } from '@/users/users.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as cryptoJS from 'crypto-js';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { CreateSeminarDto } from './dto/create-seminar.dto';
import { UpdateSeminarDto } from './dto/update-seminar.dto';
import { Cover } from './entities/cover.entity';
import { SeminarParticipant } from './entities/seminar-participant.entity';
import { Seminar } from './entities/seminar.entity';

@Injectable()
export class SeminarsService {
  UPLOAD_PROFILE_PATH = 'storage/upload/cover';

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
    private readonly usersService: UsersService,
    @InjectRepository(Cover)
    private readonly coverRepository: Repository<Cover>,
    @InjectRepository(Seminar)
    private readonly seminarRepository: Repository<Seminar>,
    @InjectRepository(SeminarParticipant)
    private readonly seminarParticipantRepository: Repository<SeminarParticipant>,
  ) {}

  getRepository() {
    return this.seminarRepository;
  }

  findAll() {
    return this.seminarRepository.find({
      relations: {
        user: true,
        seminarParticipants: {
          seminar: true,
          user: true,
        },
        category: true,
        cover: true,
      },
    });
  }

  findInvolvedSeminars(user_id: number) {
    return this.seminarParticipantRepository.find({
      where: {
        user_id,
      },
    });
  }

  async findOne(id: number) {
    try {
      return await this.seminarRepository.findOne({
        where: { id },
        relations: {
          user: {
            profiles: true,
          },
          seminarParticipants: {
            seminar: true,
            user: true,
          },
          category: true,
          cover: true,
        },
      });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error, `not found seminar ${id}`);
    }
  }

  async updateViewCount(id: number) {
    const qr = this.seminarRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();
    try {
      const dto = await this.seminarRepository.query(
        `UPDATE seminar SET view_count = view_count + 1 WHERE id=?`,
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
        'fail update view count in seminar',
        id,
      );
    }
  }

  async create(createSeminarDto: CreateSeminarDto) {
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

  async update(id: number, updateSeminarDto: UpdateSeminarDto) {
    const qr = this.seminarRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();
    try {
      await this.seminarRepository.findOneOrFail({
        where: { id },
      });
      this.loggerService.log('ok');
      const dto = await this.seminarRepository.update(id, updateSeminarDto);
      this.loggerService.log('fail?');
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      this.loggerService.log('error', error);
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail update seminar');
    }
  }

  async softRemove(id: number) {
    const qr = this.seminarRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();
    try {
      await this.seminarRepository.softDelete({ id });
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
    const qr = this.seminarRepository.manager.connection.createQueryRunner();
    await qr.startTransaction();
    try {
      await this.seminarRepository.softDelete({ id });
      await qr.commitTransaction();
      await qr.release();
      return true;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail soft remove seminar');
    }
  }

  isExistsRevertedParticipants(seminar_id: number, user_id: number) {
    return this.seminarParticipantRepository.findOne({
      where: {
        seminar_id,
        user_id,
      },
      withDeleted: true,
    });
  }

  async restoreJoinSeminar(seminarParticipant: SeminarParticipant) {
    try {
      await this.seminarRepository.findOneOrFail({
        where: { id: seminarParticipant.id },
        withDeleted: true,
      });
    } catch (error) {
      ApiResponseService.NOT_FOUND(
        error,
        `not found seminar ${seminarParticipant.id}`,
      );
    }
    await this.seminarParticipantRepository.restore({
      id: seminarParticipant.id,
    });
    return this.seminarParticipantRepository.update(seminarParticipant.id, {
      is_confirm: false,
    });
  }

  async joinSeminar(seminar_id: number, user_id: number) {
    const qr =
      this.seminarParticipantRepository.manager.connection.createQueryRunner();

    this.loggerService.log(seminar_id, user_id);

    try {
      await this.usersService
        .getRepository()
        .findOneOrFail({ where: { id: user_id } });
      await this.seminarRepository.findOneOrFail({
        where: { id: seminar_id },
      });
    } catch (error) {
      ApiResponseService.NOT_FOUND(error);
    }

    const alreadyJoined = await this.seminarParticipantRepository.findOne({
      where: {
        seminar_id,
        user_id,
      },
    });

    await qr.startTransaction();

    if (alreadyJoined === null) {
      try {
        const dto = await this.seminarParticipantRepository.save({
          seminar_id,
          user_id,
        });
        await qr.commitTransaction();
        await qr.release();
        return dto;
      } catch (error) {
        this.loggerService.log(error);
        await qr.rollbackTransaction();
        await qr.release();
        ApiResponseService.BAD_REQUEST(error, 'bad request');
      }
    } else {
      ApiResponseService.BAD_REQUEST('already joined');
    }
  }

  async confirmJoinSeminar(seminar_id: number, user_id: number) {
    const qr =
      this.seminarParticipantRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const seminarParticipantSession =
        await this.seminarParticipantRepository.findOneOrFail({
          where: {
            seminar_id,
            user_id,
          },
        });

      if (seminarParticipantSession.is_confirm) {
        return false;
      }

      const dto = await this.seminarParticipantRepository.update(
        { id: seminarParticipantSession.id },
        {
          is_confirm: true,
        },
      );
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail confirm join seminar');
    }
  }

  async cancelJoinSeminar(seminar_id: number, user_id: number) {
    const qr = this.seminarRepository.manager.connection.createQueryRunner();

    await qr.startTransaction();

    try {
      const seminarParticipantSession =
        await this.seminarParticipantRepository.findOneOrFail({
          where: {
            seminar_id,
            user_id,
          },
        });

      await this.seminarParticipantRepository.softDelete({
        id: seminarParticipantSession.id,
      });

      await qr.commitTransaction();
      await qr.release();
      return true;
    } catch (error) {
      this.loggerService.log('error', error);
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail cancel join');
    }
  }

  getCoverImage(filename: string) {
    const file = fs.readFileSync(
      path.join(path.resolve(), this.UPLOAD_PROFILE_PATH, filename),
    );
    return file;
  }

  async uploadCover(seminar_id: number, cover: Express.Multer.File) {
    const qr = this.coverRepository.manager.connection.createQueryRunner();

    try {
      fs.readdirSync(path.join(path.resolve(), this.UPLOAD_PROFILE_PATH));
    } catch (error) {
      fs.mkdirSync(path.join(path.resolve(), this.UPLOAD_PROFILE_PATH), {
        recursive: true,
      });
    }

    const seminar = await this.seminarRepository.findOne({
      where: { id: seminar_id },
    });

    if (!seminar) {
      ApiResponseService.NOT_FOUND('seminar not found', seminar_id);
    }

    const filename = cryptoJS
      .HmacSHA256(
        cover.originalname + +new Date(),
        this.configService.get<string>('encode.privkey'),
      )
      .toString();

    const extend = cover.originalname.split('.')[1];
    const newFileName = filename + '.' + extend;

    try {
      fs.writeFileSync(
        path.join(this.UPLOAD_PROFILE_PATH, newFileName),
        cover.buffer,
      );
    } catch (error) {
      ApiResponseService.BAD_REQUEST('error creating profile file');
      return;
    }

    await qr.startTransaction();

    try {
      await this.coverRepository.delete({
        seminar_id,
      });

      const dto = await this.coverRepository.save(
        {
          seminar_id,
          origin_name: cover.originalname,
          new_name: newFileName,
        },
        { transaction: true },
      );
      await qr.commitTransaction();
      await qr.release();
      return dto;
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();
      ApiResponseService.BAD_REQUEST(error, 'fail upload cover');
    }
  }
}

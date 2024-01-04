import { Test } from '@nestjs/testing';
import { SeminarsService } from '../seminars.service';
import { UpdatePipe } from './update.pipe';
import { Request, request as expressRequest } from 'express';
import { ConfigModule } from '@nestjs/config';
import encodeConfig from '@/config/encode.config';
import { ApiResponseModule } from '@/api-response/api-response.module';
import { UsersService } from '@/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { Seminar } from '../entities/seminar.entity';
import { SeminarParticipant } from '../entities/seminar-participant.entity';
import { Grade } from '@/grades/entities/grade.entity';
import { Profile } from '@/users/entities/profile.entity';
import { UserRecommend } from '@/users/entities/user-recommend.entity';
import { Cover } from '../entities/cover.entity';
import { UpdateSeminarDto } from '../dto/update-seminar.dto';
import { ArgumentMetadata } from '@nestjs/common';
import { SeminarsController } from '../seminars.controller';

const originSeminars = [
  {
    id: 1,
    host_id: 1,
    category_id: 1,
    title: 'test title',
    content: 'test content',
    meeting_place: 'seoul',
    limit_participant_amount: 15,
    recruit_start_date: new Date('2024-1-3 12:00'),
    recruit_end_date: new Date('2024-1-3 12:00'),
    seminar_start_date: new Date('2024-1-3 12:00'),
    seminar_end_date: new Date('2024-1-3 12:00'),
    is_recruit_finished: false,
    is_seminar_finished: false,
    deleted_at: null,
    created_at: new Date('2024-1-3 12:00'),
    updated_at: new Date('2024-1-3 12:00'),
  },
];

const db = {
  seminars: [...originSeminars],
};

const userValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const seminarValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneOrFail: jest.fn(({ where: { id } }: { where: { id: number } }) => {
    const item = db.seminars.find((seminar) => seminar.id === id);
    if (item) {
      return Promise.resolve(item);
    } else {
      throw new Error('not found seminar');
    }
  }),
  insert: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const seminarParticipantValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const coverValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const profileValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const gradeValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const userRecommendValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

describe('UpdatePipe', () => {
  let updatePipe: UpdatePipe;
  let request: Request;
  let seminarsService: SeminarsService;
  let coverRepository: MockRepository<Cover>;
  let userRepository: MockRepository<User>;
  let userRecommendRepository: MockRepository<UserRecommend>;
  let profileRepository: MockRepository<Profile>;
  let seminarRepository: MockRepository<Seminar>;
  let seminarParticipantRepository: MockRepository<SeminarParticipant>;
  let gradeRepository: MockRepository<Grade>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(encodeConfig), ApiResponseModule],
      providers: [
        UsersService,
        SeminarsService,
        {
          provide: getRepositoryToken(User),
          useValue: userValues(),
        },
        {
          provide: getRepositoryToken(Seminar),
          useValue: seminarValues(),
        },
        {
          provide: getRepositoryToken(UserRecommend),
          useValue: userRecommendValues(),
        },
        {
          provide: getRepositoryToken(SeminarParticipant),
          useValue: seminarParticipantValues(),
        },
        {
          provide: getRepositoryToken(Cover),
          useValue: coverValues(),
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: profileValues(),
        },
        {
          provide: getRepositoryToken(Grade),
          useValue: gradeValues(),
        },
      ],
    }).compile();

    seminarsService = module.get<SeminarsService>(SeminarsService);
    request = expressRequest;
    coverRepository = module.get(getRepositoryToken(Cover));
    userRepository = module.get(getRepositoryToken(User));
    userRecommendRepository = module.get(getRepositoryToken(UserRecommend));
    profileRepository = module.get(getRepositoryToken(Profile));
    seminarRepository = module.get(getRepositoryToken(Seminar));
    seminarParticipantRepository = module.get(
      getRepositoryToken(SeminarParticipant),
    );
    gradeRepository = module.get(getRepositoryToken(Grade));
    updatePipe = new UpdatePipe(request, seminarsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(updatePipe).toBeDefined();
    expect(coverRepository).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userRecommendRepository).toBeDefined();
    expect(profileRepository).toBeDefined();
    expect(seminarRepository).toBeDefined();
    expect(seminarParticipantRepository).toBeDefined();
    expect(gradeRepository).toBeDefined();
  });

  it('update data 적용 테스트', async () => {
    const clientUserId = 1;
    const updateSeminarData = {
      title: '테스트 제목 교체',
    };
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: SeminarsController,
      data: 'update',
    };
    const updatePipeTransformSpy = jest
      .spyOn(updatePipe, 'transform')
      .mockImplementation(
        async (value: UpdateSeminarDto, metadata: ArgumentMetadata) => {
          const existingData = await seminarRepository.findOneOrFail({
            where: {
              id: +clientUserId,
            },
          });

          return Promise.resolve({
            ...existingData,
            ...value,
          });
        },
      );

    const updateData = await updatePipe.transform(updateSeminarData, metadata);

    expect(seminarRepository.findOneOrFail).toHaveBeenCalled();
    expect(updatePipeTransformSpy).toHaveBeenCalled();
    expect(seminarRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(updatePipeTransformSpy).toHaveBeenCalledTimes(1);
    expect(seminarRepository.findOneOrFail).toHaveBeenCalledWith({
      where: { id: +clientUserId },
    });
    expect(updatePipeTransformSpy).toHaveBeenCalledWith(
      updateSeminarData,
      metadata,
    );

    expect(updateData).toStrictEqual(
      Object.assign({ ...db.seminars[0] }, updateData),
    );
  });

  it('update data 적용 Error 발생', async () => {
    const clientUserId = 2;
    const updateSeminarData = {
      title: '테스트 제목 교체',
    };
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: SeminarsController,
      data: 'update',
    };
    const updatePipeTransformSpy = jest
      .spyOn(updatePipe, 'transform')
      .mockImplementation(
        async (value: UpdateSeminarDto, metadata: ArgumentMetadata) => {
          try {
            const existingData = await seminarRepository.findOneOrFail({
              where: {
                id: +clientUserId,
              },
            });

            return Promise.resolve({
              ...existingData,
              ...value,
            });
          } catch (error) {
            throw error;
          }
        },
      );

    const updateData = updatePipe.transform(updateSeminarData, metadata);

    await expect(updateData).rejects.toThrow(new Error('not found seminar'));

    expect(seminarRepository.findOneOrFail).toHaveBeenCalled();
    expect(updatePipeTransformSpy).toHaveBeenCalled();
    expect(seminarRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    expect(updatePipeTransformSpy).toHaveBeenCalledTimes(1);
    expect(seminarRepository.findOneOrFail).toHaveBeenCalledWith({
      where: { id: +clientUserId },
    });
    expect(updatePipeTransformSpy).toHaveBeenCalledWith(
      updateSeminarData,
      metadata,
    );
  });
});

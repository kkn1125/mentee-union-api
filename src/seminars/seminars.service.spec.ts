import { Test, TestingModule } from '@nestjs/testing';
import { SeminarsService } from './seminars.service';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Seminar } from './entities/seminar.entity';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '@/users/users.module';
import { Cover } from './entities/cover.entity';
import { SeminarParticipant } from './entities/seminar-participant.entity';
import { Repository } from 'typeorm';
import { UsersService } from '@/users/users.service';
import { UserRecommend } from '@/users/entities/user-recommend.entity';
import { User } from '@/users/entities/user.entity';
import { Profile } from '@/users/entities/profile.entity';
import { Grade } from '@/grades/entities/grade.entity';
import { CreateSeminarDto } from './dto/create-seminar.dto';
import { UpdateSeminarDto } from './dto/update-seminar.dto';
import { LargeNumberLike } from 'crypto';

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

const db: {
  seminars: (Partial<Seminar> | Seminar)[];
} = {
  seminars: [...originSeminars],
};

const seminarValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  save: jest.fn((createSeminarDto: CreateSeminarDto) => {
    const genDto = {
      id: db.seminars[db.seminars.length - 1].id + 1,
      ...createSeminarDto,
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    db.seminars.push(genDto);
    return Promise.resolve(genDto);
  }),
  update: jest.fn((id: number, data: UpdateSeminarDto) => {
    const index = db.seminars.findIndex((seminar) => seminar.id === id);
    db.seminars.splice(index, 1, Object.assign(db.seminars, data));
    return Promise.resolve(db.seminars.at(index));
  }),
  delete: jest.fn(({ id }: { id: number }) => {
    const index = db.seminars.findIndex((seminar) => seminar.id === id);
    if (index > -1) {
      db.seminars.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }),
  softDelete: jest.fn(),
});

const seminarParticipantValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const coverValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const userValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const userRecommendValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const profileValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const gradeValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

describe('SeminarsService', () => {
  let service: SeminarsService;
  let usersService: UsersService;
  let seminarRepository: MockRepository<Seminar>;
  let seminarParticipantRepository: MockRepository<SeminarParticipant>;
  let userRepository: MockRepository<User>;
  let userRecommendRepository: MockRepository<UserRecommend>;
  let coverRepository: MockRepository<Cover>;
  let profileRepository: MockRepository<Profile>;
  let gradeRepository: MockRepository<Grade>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        UsersService,
        SeminarsService,
        {
          provide: getRepositoryToken(Seminar),
          useValue: seminarValues(),
        },
        {
          provide: getRepositoryToken(SeminarParticipant),
          useValue: seminarParticipantValues(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: userValues(),
        },
        {
          provide: getRepositoryToken(UserRecommend),
          useValue: userRecommendValues(),
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

    service = module.get<SeminarsService>(SeminarsService);
    usersService = module.get<UsersService>(UsersService);
    seminarRepository = module.get<MockRepository<Seminar>>(
      getRepositoryToken(Seminar),
    );
    seminarParticipantRepository = module.get(
      getRepositoryToken(SeminarParticipant),
    );
    userRepository = module.get(getRepositoryToken(User));
    userRecommendRepository = module.get(getRepositoryToken(UserRecommend));
    coverRepository = module.get(getRepositoryToken(Cover));
    profileRepository = module.get(getRepositoryToken(Profile));
    gradeRepository = module.get(getRepositoryToken(Grade));
  });

  afterEach(() => {
    db.seminars = [...originSeminars];
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeDefined();
    expect(usersService).toBeDefined();
    expect(seminarRepository).toBeDefined();
    expect(seminarParticipantRepository).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userRecommendRepository).toBeDefined();
    expect(coverRepository).toBeDefined();
    expect(profileRepository).toBeDefined();
    expect(gradeRepository).toBeDefined();
  });

  it('세미나를 전체 조회한다.', async () => {
    jest.spyOn(service, 'findAll').mockImplementation(() => {
      return Promise.resolve(db.seminars as Seminar[]);
    });

    const list = await service.findAll();
    expect(list).toStrictEqual(db.seminars);
  });

  it('세미나를 생성한다.', async () => {
    const addSeminarData = {
      host_id: 2,
      category_id: 1,
      title: '테스트 세미나',
      content: '세미나 내용입니다.',
      meeting_place: '서울',
      is_recruit_finished: false,
      is_seminar_finished: false,
      recruit_start_date: new Date('2024-1-4 12:00'),
      recruit_end_date: new Date('2024-1-5 16:00'),
      seminar_start_date: new Date('2024-1-6 9:00'),
      seminar_end_date: new Date('2024-1-6 15:00'),
      limit_participant_amount: 0,
    };
    const findAllSpy = jest.spyOn(service, 'findAll').mockImplementation(() => {
      return Promise.resolve(db.seminars as Seminar[]);
    });
    const seminarSaveSpy = jest.spyOn(seminarRepository, 'save');
    const serviceCreateSpy = jest
      .spyOn(service, 'create')
      .mockImplementation((createSeminarDto: CreateSeminarDto) => {
        return seminarRepository.save(createSeminarDto);
      });

    const list = await service.findAll();
    expect(findAllSpy).toHaveBeenCalled();
    expect(list).toStrictEqual(db.seminars);
    expect(list.length).toStrictEqual(1);
    expect(list[list.length - 1].id).toStrictEqual(1);

    await service.create(addSeminarData);

    expect(findAllSpy).toHaveBeenCalled();
    expect(findAllSpy).toHaveBeenCalledWith();
    expect(seminarSaveSpy).toHaveBeenCalled();
    expect(seminarSaveSpy).toHaveBeenCalledWith(addSeminarData);
    expect(serviceCreateSpy).toHaveBeenCalledWith(addSeminarData);
    expect(findAllSpy).toHaveBeenCalled();
    expect(serviceCreateSpy).toHaveBeenCalled();
    expect(list).toStrictEqual(db.seminars);
    expect(list[list.length - 1].id).toStrictEqual(2);
  });

  it('세미나를 수정한다.', async () => {
    const seminarUpdateId = 1;
    const seminarUpdateData = {
      title: '테스트 세미나',
      seminar_start_date: new Date('2024-1-4 13:00'),
      seminar_end_date: new Date('2024-1-5 18:00'),
    };

    const seminarRepositoryUpdateSpy = jest.spyOn(seminarRepository, 'update');
    const seminarUpdateSpy = jest
      .spyOn(service, 'update')
      .mockImplementation((id: number, data: UpdateSeminarDto) => {
        return seminarRepository.update(id, data);
      });

    await service.update(seminarUpdateId, seminarUpdateData);

    const resultData = await seminarRepositoryUpdateSpy.mock.results[0].value;

    expect(seminarRepositoryUpdateSpy).toHaveBeenCalled();
    expect(seminarRepositoryUpdateSpy).toHaveBeenCalledWith(
      seminarUpdateId,
      seminarUpdateData,
    );
    expect(seminarUpdateSpy).toHaveBeenCalled();
    expect(seminarUpdateSpy).toHaveBeenCalledWith(
      seminarUpdateId,
      seminarUpdateData,
    );
    expect(resultData.title).toStrictEqual(seminarUpdateData.title);
    expect(resultData.seminar_start_date).toStrictEqual(
      seminarUpdateData.seminar_start_date,
    );
    expect(resultData.seminar_end_date).toStrictEqual(
      seminarUpdateData.seminar_end_date,
    );
  });

  it('세미나를 삭제한다.', async () => {
    const deleteSeminarId = 1;

    const seminarRepositoryDeleteSpy = jest.spyOn(seminarRepository, 'delete');
    const serviceDeleteSpy = jest
      .spyOn(service, 'remove')
      .mockImplementation((id: number) => {
        return seminarRepository.delete({ id });
      });

    await service.remove(deleteSeminarId);

    expect(seminarRepositoryDeleteSpy).toHaveBeenCalled();
    expect(seminarRepositoryDeleteSpy).toHaveBeenCalledWith({
      id: deleteSeminarId,
    });
    expect(db.seminars.length).toStrictEqual(0);
    expect(serviceDeleteSpy).toHaveBeenCalled();
    expect(serviceDeleteSpy).toHaveBeenCalledWith(deleteSeminarId);
  });
});

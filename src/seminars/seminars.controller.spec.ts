import { Test, TestingModule } from '@nestjs/testing';
import { SeminarsController } from './seminars.controller';
import { SeminarsService } from './seminars.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cover } from './entities/cover.entity';
import { Repository } from 'typeorm';
import { Seminar } from './entities/seminar.entity';
import { SeminarParticipant } from './entities/seminar-participant.entity';
import { User } from '@/users/entities/user.entity';
import { Profile } from '@/users/entities/profile.entity';
import { UserRecommend } from '@/users/entities/user-recommend.entity';
import { Grade } from '@/grades/entities/grade.entity';

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

const userValues = () => ({
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

const seminarValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
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

describe('SeminarsController', () => {
  let controller: SeminarsController;
  let service: SeminarsService;
  let coverRepository: MockRepository<Cover>;
  let userRepository: MockRepository<User>;
  let userRecommendRepository: MockRepository<UserRecommend>;
  let profileRepository: MockRepository<Profile>;
  let seminarRepository: MockRepository<Seminar>;
  let seminarParticipantRepository: MockRepository<SeminarParticipant>;
  let gradeRepository: MockRepository<Grade>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeminarsController],
      providers: [
        ConfigService,
        SeminarsService,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userValues(),
        },
        {
          provide: getRepositoryToken(UserRecommend),
          useValue: userRecommendValues(),
        },
        {
          provide: getRepositoryToken(Seminar),
          useValue: seminarValues(),
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

    controller = module.get<SeminarsController>(SeminarsController);
    service = module.get<SeminarsService>(SeminarsService);
    coverRepository = module.get(getRepositoryToken(Cover));
    userRepository = module.get(getRepositoryToken(User));
    userRecommendRepository = module.get(getRepositoryToken(UserRecommend));
    profileRepository = module.get(getRepositoryToken(Profile));
    seminarRepository = module.get(getRepositoryToken(Seminar));
    seminarParticipantRepository = module.get(
      getRepositoryToken(SeminarParticipant),
    );
    gradeRepository = module.get(getRepositoryToken(Grade));

    seminarRepository.find.mockResolvedValue(Promise.resolve(db.seminars));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('전체 세미나를 조회한다.', () => {
    let seminars: Seminar[];
    let controllerFindAllSpy: jest.SpyInstance<Promise<Seminar[]>, [], any>;
    let serviceFindAllSpy: jest.SpyInstance<Promise<Seminar[]>, [], any>;

    beforeEach(async () => {
      controllerFindAllSpy = jest
        .spyOn(controller, 'findAll')
        .mockImplementation(() => {
          return service.findAll();
        });
      serviceFindAllSpy = jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => {
          return seminarRepository.find();
        });
      seminars = await controller.findAll();
    });

    it('controller method findAll have been called', () => {
      expect(controllerFindAllSpy).toHaveBeenCalled();
    });
    it('controller method findAll spy have been called', () => {
      expect(controllerFindAllSpy).toHaveBeenCalledTimes(1);
    });
    it('seminar repository find have been called', () => {
      expect(seminarRepository.find).toHaveBeenCalledTimes(1);
    });
    it('service findAll spy have been called', () => {
      expect(serviceFindAllSpy).toHaveBeenCalled();
    });
    it('service findAll spy have been called one times', () => {
      expect(serviceFindAllSpy).toHaveBeenCalledTimes(1);
    });
    it('seminar list lenth is one', () => {
      expect(seminars.length).toStrictEqual(1);
    });
    it("first seminar item's title is matched", () => {
      expect(seminars[0].title).toStrictEqual('test title');
    });
  });
});

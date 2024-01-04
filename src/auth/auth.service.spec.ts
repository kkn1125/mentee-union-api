import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { Grade } from '@/grades/entities/grade.entity';
import { Profile } from '@/users/entities/profile.entity';
import { UserRecommend } from '@/users/entities/user-recommend.entity';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@/mailer/mailer.service';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';

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
  insert: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  softDelete: jest.fn(),
});

const profileValues = () => ({
  insert: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  softDelete: jest.fn(),
});

const gradeValues = () => ({
  insert: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  softDelete: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockRepository<User>;
  let userRecommendRepository: MockRepository<UserRecommend>;
  let profileRepository: MockRepository<Profile>;
  let gradeRepository: MockRepository<Grade>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        JwtService,
        MailerService,
        UsersService,
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userValues(),
        },
        {
          provide: getRepositoryToken(UserRecommend),
          useValue: userRecommendValues(),
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

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    userRecommendRepository = module.get(getRepositoryToken(UserRecommend));
    profileRepository = module.get(getRepositoryToken(Profile));
    gradeRepository = module.get(getRepositoryToken(Grade));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

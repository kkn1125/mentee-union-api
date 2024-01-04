import { ApiResponseModule } from '@/api-response/api-response.module';
import { AuthService } from '@/auth/auth.service';
import { Grade } from '@/grades/entities/grade.entity';
import { LoggerService } from '@/logger/logger.service';
import { MailerService } from '@/mailer/mailer.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Profile } from './entities/profile.entity';
import { UserRecommend } from './entities/user-recommend.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

interface Database {
  users: Partial<User>[];
}

const db: Database = {
  users: [
    {
      id: 1,
      grade_id: 1,
      username: 'test',
      email: 'test@gmail.com',
      password: '1234',
      phone_number: '010-1212-2323',
      birth: new Date('1993-11-25'),
      gender: 0,
      auth_email: true,
      level: 0,
      points: 0,
      fail_login_count: 0,
      last_login_at: new Date(),
      status: 'logout',
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
};

const provideValues = () => ({
  insert: jest.fn().mockImplementation((dto: CreateUserDto) =>
    Promise.resolve(
      db.users.push({
        id: 2,
        grade_id: 1,
        username: dto.username,
        email: dto.email,
        password: dto.password,
        level: 0,
        points: 0,
        last_login_at: new Date(),
        auth_email: true,
        status: 'logout',
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }),
    ),
  ),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest
    .fn()
    .mockImplementation((id: { where: { id: number } }) =>
      Promise.resolve(db.users.find((user) => user.id === id.where.id)),
    ),
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

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let userRepository: MockRepository<User>;
  let userRecommendRepository: MockRepository<UserRecommend>;
  let profileRepository: MockRepository<Profile>;
  let gradeRepository: MockRepository<Grade>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ApiResponseModule],
      controllers: [UsersController],
      providers: [
        AuthService,
        ConfigService,
        MailerService,
        LoggerService,
        JwtService,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: provideValues(),
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

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    userRecommendRepository = module.get(getRepositoryToken(UserRecommend));
    profileRepository = module.get(getRepositoryToken(Profile));
    gradeRepository = module.get(getRepositoryToken(Grade));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('findOne Test', async () => {
    const user = await service.findOne(1);
    expect(user.email).toStrictEqual('test@gmail.com');
  });

  it('create Test', async () => {
    const insertData = {
      grade_id: 1,
      username: 'devkimson',
      email: 'devkimson2@gmail.com',
      password: '1234',
      auth_email: true,
      phone_number: '010-3434-4545',
      birth: new Date('1992-10-12'),
      gender: 0,
    };
    const insertSpy = jest
      .spyOn(service, 'create')
      .mockImplementation((createUserDto: CreateUserDto) => {
        const dto = {
          id: (db.users[db.users.length - 1]?.id || 0) + 1,
          username: createUserDto.username,
          email: createUserDto.email,
          phone_number: createUserDto.phone_number,
          birth: createUserDto.birth,
          gender: createUserDto.gender,
          password: createUserDto.password,
          auth_mail: false,
          level: 0,
          points: 0,
          last_login_at: new Date(),
          status: 'logout',
          deleted_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        } as unknown as User;
        db.users.push(dto);
        return Promise.resolve(dto);
      });

    const user = await service.create(insertData);
    expect(insertSpy).toHaveBeenCalled();
    expect(insertSpy).toHaveBeenCalledTimes(1);
    expect(insertSpy).toHaveBeenCalledWith(insertData);
    expect(user.email).toStrictEqual('devkimson2@gmail.com');
  });
});

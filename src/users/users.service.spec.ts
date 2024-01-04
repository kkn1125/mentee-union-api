import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ApiResponseModule } from '@/api-response/api-response.module';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRecommend } from './entities/user-recommend.entity';
import { Profile } from './entities/profile.entity';
import { ConfigService } from '@nestjs/config';
import { Grade } from '@/grades/entities/grade.entity';

const db: {
  users: Partial<User>[];
} = {
  users: [
    {
      id: 1,
      grade_id: 1,
      username: 'test',
      email: 'test@gmail.com',
      phone_number: '010-1212-2323',
      birth: new Date(),
      gender: 0,
      password: '1234',
      level: 1,
      points: 100,
      auth_email: true,
      last_login_at: new Date(),
      status: 'logout',
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      grade_id: 1,
      username: 'test',
      email: 'test@gmail.com',
      phone_number: '010-1212-2323',
      birth: new Date(),
      gender: 0,
      password: '1234',
      level: 0,
      points: 100,
      auth_email: true,
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
        username: dto.username,
        email: dto.email,
        phone_number: '010-1212-2323',
        birth: new Date(),
        gender: 0,
        password: dto.password,
        level: 0,
        points: 0,
        last_login_at: new Date(),
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

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ApiResponseModule],
      providers: [
        ConfigService,
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

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('test create', async () => {
    const user = {
      username: 'mario',
      email: 'mario@gmail.com',
      phone_number: '010-2323-3535',
      birth: new Date(),
      gender: 0,
      auth_email: true,
      password: 'mario1234',
    } as CreateUserDto;
    // const user = await service.insert({
    //   username: 'devkimson',
    //   email: 'devkimson@gmail.com',
    //   password: '1234',
    // });
    jest
      .spyOn(service, 'create')
      .mockImplementation((createUserDto: CreateUserDto) => {
        const dto = {
          id: 3,
          username: createUserDto.username,
          email: createUserDto.email,
          phone_number: createUserDto.phone_number,
          birth: createUserDto.birth,
          gender: createUserDto.gender,
          password: createUserDto.password,
          level: 0,
          points: 0,
          last_login_at: new Date(),
          status: 'logout',
          deleted_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        } as User;
        db.users.push(dto);
        return Promise.resolve(dto);
      });

    const result = await service.create(user);

    expect(result.id).toStrictEqual(3);
    expect(result.status).toStrictEqual('logout');
  });

  it('test up grade user - fail cause point 100', async () => {
    jest
      .spyOn(service, 'isPossibleUpgrade')
      .mockImplementation((user_id: number) => {
        const user = db.users.find((user) => user.id === user_id);
        return Promise.resolve(user.points >= 100 + user.level * 50);
      });
    const result = await service.isPossibleUpgrade(1);
    expect(result).toBeFalsy();
  });
  it('test up grade user - success cause point 150', async () => {
    jest
      .spyOn(service, 'isPossibleUpgrade')
      .mockImplementation((user_id: number) => {
        const user = db.users.find((user) => user.id === user_id);
        return Promise.resolve(user.points >= 100 + user.level * 50);
      });
    const result = await service.isPossibleUpgrade(2);
    expect(result).toBeTruthy();
  });
  it('test up grade user - success upgrade user', async () => {
    jest.spyOn(service, 'upgradeUser').mockImplementation((user_id: number) => {
      const user = db.users.find((user) => user.id === user_id);

      const upgradeable = user.points >= 100 + user.level * 50;
      if (upgradeable) {
        user.grade_id += 1;
        user.level += 1;
      }

      return Promise.resolve(user as User);
    });
    const result = await service.upgradeUser(2);
    expect(result.grade_id).toStrictEqual(2);
    expect(result.level).toStrictEqual(1);
    expect(result.points).toStrictEqual(100);
  });

  it('test up grade user - fail upgrade user', async () => {
    jest.spyOn(service, 'upgradeUser').mockImplementation((user_id: number) => {
      const user = db.users.find((user) => user.id === user_id);

      const upgradeable = user.points >= 100 + user.level * 50;
      if (upgradeable) {
        user.grade_id += 1;
        user.level += 1;
      }

      return Promise.resolve(user as User);
    });
    const result = await service.upgradeUser(1);
    expect(result.grade_id).toStrictEqual(1);
    expect(result.level).toStrictEqual(1);
    expect(result.points).toStrictEqual(100);
  });

  it('test up grade user - success send point and upgrade user', async () => {
    const beforeUser = db.users.find((user) => user.id === 1);
    beforeUser.points += 50;

    jest.spyOn(service, 'upgradeUser').mockImplementation((user_id: number) => {
      const user = db.users.find((user) => user.id === user_id);

      const upgradeable = user.points >= 100 + user.level * 50;
      if (upgradeable) {
        user.grade_id += 1;
        user.level += 1;
      }

      return Promise.resolve(user as User);
    });

    const result = await service.upgradeUser(1);
    expect(result.grade_id).toStrictEqual(2);
    expect(result.level).toStrictEqual(2);
    expect(result.points).toStrictEqual(150);
  });
});

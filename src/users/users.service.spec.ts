import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ApiResponseModule } from '@/api-response/api-response.module';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

const db = {
  users: [
    {
      id: 1,
      username: 'test',
      email: 'test@gmail.com',
      phone_number: '010-1212-2323',
      birth: new Date(),
      gender: '0',
      password: '1234',
      level: 0,
      points: 0,
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
        gender: '0',
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

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ApiResponseModule],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: provideValues(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
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
      gender: '0',
      password: 'mario1234',
    };
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
});

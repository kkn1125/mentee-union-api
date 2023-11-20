import { ApiResponseModule } from '@/api-response/api-response.module';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const db = {
  users: [
    {
      id: 1,
      username: 'test',
      email: 'test@gmail.com',
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

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ApiResponseModule],
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: provideValues(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
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
    const user = await service.create({
      username: 'devkimson',
      email: 'devkimson@gmail.com',
      password: '1234',
    });
    expect(user.email).toStrictEqual('test@gmail.com');
  });
});

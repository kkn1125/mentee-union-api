import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';

interface Database {
  boards: Partial<Board>[];
}

const db: Database = {
  boards: [
    {
      id: 1,
      title: '테스트 게시글',
      content: '테스트 내용',
      type: 'qna',
      sequence: -1,
      view_count: 0,
      visible: true,
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
};

const boardValues = () => ({
  find: jest.fn(() => {
    return Promise.resolve(db.boards);
  }),
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

type MockRepository<T = any> = Record<keyof Repository<T>, jest.Mock>;

describe('BoardsService', () => {
  let service: BoardsService;
  let boardRepository: MockRepository<Board>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getRepositoryToken(Board),
          useValue: boardValues(),
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    boardRepository = module.get(getRepositoryToken(Board));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('전체 게시글을 조회한다.', async () => {
    const boardRepositoryFindAllSpy = jest
      .spyOn(service, 'findAll')
      .mockImplementation(() => {
        //
        return boardRepository.find();
      });

    const boardList = await service.findAll();
    expect(boardRepository.find).toHaveBeenCalled();
    expect(boardRepository.find).toHaveBeenCalledWith();
    expect(boardRepository.find).toHaveBeenCalledTimes(1);
    expect(boardRepositoryFindAllSpy).toHaveBeenCalled();
    expect(boardRepositoryFindAllSpy).toHaveBeenCalledWith();
    expect(boardRepositoryFindAllSpy).toHaveBeenCalledTimes(1);
    expect(boardList.length).toStrictEqual(1);
  });
});

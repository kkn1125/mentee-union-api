import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MentoringSession } from '@/mentoring-session/entities/mentoring-session.entity';
import { ReadMessage } from './entities/read-message.entity';
import { MentoringSessionService } from '@/mentoring-session/mentoring-session.service';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';

interface Database {
  readedUsers: Partial<ReadMessage>[];
  users: Partial<User>[];
  mentoringSessions: Partial<MentoringSession>[];
  messages: Partial<Message>[];
}

const db: Database = {
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
      username: 'test2',
      email: 'test2@gmail.com',
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
  mentoringSessions: [
    {
      id: 1,
      category_id: 1,
      topic: '첫 토픽',
      objective: '이직',
      format: 'offline',
      note: 'no note',
      is_private: false,
      password: null,
      limit: 5,
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  messages: [
    {
      id: 1,
      user_id: 1,
      mentoring_session_id: 1,
      message: '안녕하세요',
      is_top: false,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      user_id: 2,
      mentoring_session_id: 1,
      message: '네, 안녕하세요',
      is_top: false,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      user_id: 1,
      mentoring_session_id: 1,
      message: '오후 3시 다시 만납시다',
      is_top: false,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  readedUsers: [
    {
      id: 1,
      user_id: 1,
      message_id: 1,
    },
    {
      id: 1,
      user_id: 1,
      message_id: 2,
    },
    {
      id: 1,
      user_id: 2,
      message_id: 1,
    },
    {
      id: 1,
      user_id: 2,
      message_id: 2,
    },
    {
      id: 1,
      user_id: 1,
      message_id: 3,
    },
  ],
};

const messageValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const readMessageValues = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

const mentoringSessionValues = () => ({
  find: jest.fn(),
  findOne: jest.fn((session_id: number) => {
    const session = db.mentoringSessions.find(
      (session) => session.id === session_id,
    );

    if (session) {
      Object.assign(session, {
        messages: db.messages
          .filter((message) => message.mentoring_session_id === session.id)
          .map((message) =>
            Object.assign(message, {
              readedUsers: db.readedUsers.filter(
                (readed) => readed.message_id === message.id,
              ),
            }),
          ),
      });

      return Promise.resolve(session);
    } else {
      return null;
    }
  }),
  insert: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
});

describe('MessagesService', () => {
  let service: MessagesService;
  let messageRepository: MockRepository<Message>;
  let readMessageRepository: MockRepository<ReadMessage>;
  let mentoringSessionRepository: MockRepository<MentoringSession>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(Message),
          useValue: messageValues(),
        },
        {
          provide: getRepositoryToken(ReadMessage),
          useValue: readMessageValues(),
        },
        {
          provide: getRepositoryToken(MentoringSession),
          useValue: mentoringSessionValues(),
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messageRepository = module.get(getRepositoryToken(Message));
    readMessageRepository = module.get(getRepositoryToken(ReadMessage));
    mentoringSessionRepository = module.get(
      getRepositoryToken(MentoringSession),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('메세지를 모두 조회한다.', async () => {
    const repositoryFindAllMessageSpy = jest
      .spyOn(service, 'findAll')
      .mockImplementation(() => {
        return Promise.resolve(db.messages as Message[]);
      });

    const list = await service.findAll();

    expect(repositoryFindAllMessageSpy).toHaveBeenCalled();
    expect(repositoryFindAllMessageSpy).toHaveBeenCalledTimes(1);
    expect(list[0].message).toStrictEqual('안녕하세요');
    expect(list).toStrictEqual(db.messages);
  });

  it('읽지 않은 세션의 메세지를 조회한다.', async () => {
    const userId = 2;
    const mentoringSessionId = 1;
    const repositoryFindNotReadedMessageInSessions = jest
      .spyOn(service, 'findSessionsHaveNotReadedMessages')
      .mockImplementation(async (user_id: number, session_id: number) => {
        const mentoringSession: MentoringSession =
          await mentoringSessionRepository.findOne(session_id);
        const notReadedMessageSessions = mentoringSession.messages.filter(
          (message: Message) =>
            message.readedUsers.every((readed) => readed.user_id !== user_id),
        );
        return Promise.resolve(notReadedMessageSessions);
      });

    const notReadedMessageList =
      await service.findSessionsHaveNotReadedMessages(
        userId,
        mentoringSessionId,
      );

    expect(mentoringSessionRepository.findOne).toHaveBeenCalled();
    expect(mentoringSessionRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mentoringSessionRepository.findOne).toHaveBeenCalledWith(
      mentoringSessionId,
    );
    expect(repositoryFindNotReadedMessageInSessions).toHaveBeenCalled();
    expect(repositoryFindNotReadedMessageInSessions).toHaveBeenCalledWith(
      userId,
      mentoringSessionId,
    );
    expect(repositoryFindNotReadedMessageInSessions).toHaveBeenCalledTimes(1);
    expect(notReadedMessageList.length).toStrictEqual(1);
    expect(notReadedMessageList[0].message).toStrictEqual(
      db.messages[db.messages.length - 1].message,
    );
    expect(notReadedMessageList[0].message).toStrictEqual(
      '오후 3시 다시 만납시다',
    );
  });
});

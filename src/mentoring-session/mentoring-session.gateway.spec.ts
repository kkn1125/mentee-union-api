import { Test, TestingModule } from '@nestjs/testing';
import { MentoringSessionGateway } from './mentoring-session.gateway';

describe('MentoringSessionGateway', () => {
  let gateway: MentoringSessionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentoringSessionGateway],
    }).compile();

    gateway = module.get<MentoringSessionGateway>(MentoringSessionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

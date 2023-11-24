import { Test, TestingModule } from '@nestjs/testing';
import { MentoringSessionService } from './mentoring-session.service';

describe('MentoringSessionService', () => {
  let service: MentoringSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentoringSessionService],
    }).compile();

    service = module.get<MentoringSessionService>(MentoringSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

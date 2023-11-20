import { Test, TestingModule } from '@nestjs/testing';
import { MentoringService } from './mentoring.service';

describe('MentoringService', () => {
  let service: MentoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentoringService],
    }).compile();

    service = module.get<MentoringService>(MentoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

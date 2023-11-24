import { Test, TestingModule } from '@nestjs/testing';
import { GradesService } from './grades.service';

describe('GradeService', () => {
  let service: GradesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GradesService],
    }).compile();

    service = module.get<GradesService>(GradesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

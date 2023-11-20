import { Test, TestingModule } from '@nestjs/testing';
import { MentoringController } from './mentoring.controller';
import { MentoringService } from './mentoring.service';

describe('MentoringController', () => {
  let controller: MentoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentoringController],
      providers: [MentoringService],
    }).compile();

    controller = module.get<MentoringController>(MentoringController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

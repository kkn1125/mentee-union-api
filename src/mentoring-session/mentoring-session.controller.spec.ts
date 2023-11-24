import { Test, TestingModule } from '@nestjs/testing';
import { MentoringSessionController } from './mentoring-session.controller';
import { MentoringSessionService } from './mentoring-session.service';

describe('MentoringSessionController', () => {
  let controller: MentoringSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentoringSessionController],
      providers: [MentoringSessionService],
    }).compile();

    controller = module.get<MentoringSessionController>(MentoringSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

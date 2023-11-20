import { Test, TestingModule } from '@nestjs/testing';
import { SeminarsController } from './seminars.controller';
import { SeminarsService } from './seminars.service';

describe('SeminarsController', () => {
  let controller: SeminarsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeminarsController],
      providers: [SeminarsService],
    }).compile();

    controller = module.get<SeminarsController>(SeminarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

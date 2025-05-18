import { Test, TestingModule } from '@nestjs/testing';
import { LesspassController } from './lesspass.controller';

describe('LesspassController', () => {
  let controller: LesspassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LesspassController],
    }).compile();

    controller = module.get<LesspassController>(LesspassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

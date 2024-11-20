import { Test, TestingModule } from '@nestjs/testing';
import { SigfoxController } from './sigfox.controller';

describe('SigfoxController', () => {
  let controller: SigfoxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SigfoxController],
    }).compile();

    controller = module.get<SigfoxController>(SigfoxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

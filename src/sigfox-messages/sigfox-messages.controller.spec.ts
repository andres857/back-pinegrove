import { Test, TestingModule } from '@nestjs/testing';
import { SigfoxMessagesController } from './sigfox-messages.controller';

describe('SigfoxMessagesController', () => {
  let controller: SigfoxMessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SigfoxMessagesController],
    }).compile();

    controller = module.get<SigfoxMessagesController>(SigfoxMessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

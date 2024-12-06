import { Test, TestingModule } from '@nestjs/testing';
import { SigfoxMessagesService } from './sigfox-messages.service';

describe('SigfoxMessagesService', () => {
  let service: SigfoxMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SigfoxMessagesService],
    }).compile();

    service = module.get<SigfoxMessagesService>(SigfoxMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

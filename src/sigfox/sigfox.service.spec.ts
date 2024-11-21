import { Test, TestingModule } from '@nestjs/testing';
import { SigfoxService } from './sigfox.service';

describe('SigfoxService', () => {
  let service: SigfoxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SigfoxService],
    }).compile();

    service = module.get<SigfoxService>(SigfoxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

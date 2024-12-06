import { Module } from '@nestjs/common';
import { SigfoxMessagesService } from './sigfox-messages.service';
import { SigfoxMessagesController } from './sigfox-messages.controller';

@Module({
  providers: [SigfoxMessagesService],
  controllers: [SigfoxMessagesController]
})
export class SigfoxMessagesModule {}

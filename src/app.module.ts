import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SigfoxController } from './sigfox/sigfox.controller';
import { SigfoxModule } from './sigfox/sigfox.module';

@Module({
  imports: [SigfoxModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

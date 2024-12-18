import { Module, forwardRef  } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { DeviceModule } from 'src/device/device.module';
import { SigfoxMessagesModule } from 'src/sigfox-messages/sigfox-messages.module';

import { Client } from 'src/entities/client.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
        Client
    ]),
    forwardRef(() => DeviceModule),
    forwardRef(() => SigfoxMessagesModule),
  ],
  providers: [ClientsService],
  controllers: [ClientsController],
  exports: [ClientsService]
})
export class ClientsModule {}

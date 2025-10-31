import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { ClientsModule } from 'src/clients/clients.module';

import { SigfoxDevice } from 'src/entities/sigfox-device.entity';
import { Client } from 'src/entities/client.entity';
import { SigfoxMessage } from 'src/entities/sigfox-message.entity';
import { Location } from 'src/entities/location.entity';
import { DeviceLocationHistory } from 'src/entities/device-location-history.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      SigfoxDevice,
      Client,
      SigfoxMessage,
      Location,
      DeviceLocationHistory
    ]),
    forwardRef(() => ClientsModule),
  ],
  providers: [DeviceService],
  controllers: [DeviceController],
  exports: [DeviceService]
})
export class DeviceModule {}

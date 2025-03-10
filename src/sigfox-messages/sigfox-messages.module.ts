import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SigfoxMessagesService } from './sigfox-messages.service';
import { SigfoxMessagesController } from './sigfox-messages.controller';
import { DeviceModule } from 'src/device/device.module';
import { LocationsModule } from 'src/locations/locations.module';

import { SigfoxMessage } from 'src/entities/sigfox-message.entity';
import { SigfoxDevice } from 'src/entities/sigfox-device.entity';
import { DeviceLocationHistory } from 'src/entities/device-location-history.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      SigfoxMessage,
      SigfoxDevice,
      DeviceLocationHistory
    ]),
    forwardRef(() => DeviceModule),
    forwardRef(() => LocationsModule)
  ],
  providers: [SigfoxMessagesService, ],
  controllers: [SigfoxMessagesController],
  exports: [SigfoxMessagesService]
})
export class SigfoxMessagesModule {}

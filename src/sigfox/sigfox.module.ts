import { Module } from '@nestjs/common';
import { SigfoxController } from './sigfox.controller'
import { TypeOrmModule } from '@nestjs/typeorm';

import { SigfoxMessagesModule } from 'src/sigfox-messages/sigfox-messages.module';
import { DeviceModule } from 'src/device/device.module';

// entidades 
import { SigfoxDevice } from '../entities/sigfox-device.entity';
import { SigfoxMessage } from '../entities/sigfox-message.entity';
import { Location } from '../entities/location.entity';
import { DeviceLocationHistory } from '../entities/device-location-history.entity';
import { SigfoxService } from './sigfox.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SigfoxDevice,
            SigfoxMessage,
            Location,
            DeviceLocationHistory
        ]),
        SigfoxMessagesModule,
        DeviceModule
    ],
    controllers: [ SigfoxController ],
    providers: [SigfoxService]
})
export class SigfoxModule {}

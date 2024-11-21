import { Module } from '@nestjs/common';
import { SigfoxController } from './sigfox.controller'
import { TypeOrmModule } from '@nestjs/typeorm';

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
        ])
    ],
    controllers: [ SigfoxController ],
    providers: [SigfoxService]
})
export class SigfoxModule {}

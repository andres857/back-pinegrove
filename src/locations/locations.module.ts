import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

import { Location } from 'src/entities/location.entity';
import { Client } from 'src/entities/client.entity';

import { SigfoxMessagesModule } from 'src/sigfox-messages/sigfox-messages.module';
import { DeviceModule } from 'src/device/device.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Client,
      Location
    ]),
    SigfoxMessagesModule,
    DeviceModule
  ],
  providers: [LocationsService],
  controllers: [LocationsController]
})
export class LocationsModule {}

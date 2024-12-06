import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { ClientsModule } from 'src/clients/clients.module';

import { SigfoxDevice } from 'src/entities/sigfox-device.entity';
import { Client } from 'src/entities/client.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      SigfoxDevice,
      Client
    ]),
    ClientsModule,
  ],
  providers: [DeviceService],
  controllers: [DeviceController],
  exports: [DeviceService]
})
export class DeviceModule {}

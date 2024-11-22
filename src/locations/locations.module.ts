import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

import { Location } from 'src/entities/location.entity';
import { Client } from 'src/entities/client.entity';

@Module({
    imports:[
        TypeOrmModule.forFeature([
          Client,
          Location
        ])
      ],
      providers: [LocationsService],
      controllers: [LocationsController]
})
export class LocationsModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SigfoxModule } from './sigfox/sigfox.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { RolesModule } from './roles/roles.module';

// entities
import { SigfoxDevice } from './entities/sigfox-device.entity';
import { SigfoxMessage } from './entities/sigfox-message.entity';
import { Location } from './entities/location.entity';
import { DeviceLocationHistory } from './entities/device-location-history.entity';
import { Client } from './entities/client.entity';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { LocationsModule } from './locations/locations.module';
import { DeviceModule } from './device/device.module';
import { SigfoxMessagesModule } from './sigfox-messages/sigfox-messages.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST,
      port: 5428,
      password: process.env.POSTGRES_PASSWORD_DEVEL,
      username: process.env.POSTGRES_USER_DEVEL,
      database: process.env.POSTGRES_DB_DEVEL,
      synchronize: true,
      logging: true,
      entities: [
        SigfoxDevice,
        SigfoxMessage,
        Location,
        DeviceLocationHistory,
        Client,
        User,
        Role
      ],
    }),
    SigfoxModule,
    UsersModule,
    ClientsModule,
    RolesModule,
    LocationsModule,
    DeviceModule,
    SigfoxMessagesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

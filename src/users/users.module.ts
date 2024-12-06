import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';
import { Client } from 'src/entities/client.entity';
import { Role } from 'src/entities/role.entity';
 
@Module({
  imports:[
    TypeOrmModule.forFeature([
      User,
      Client,
      Role
    ])
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}

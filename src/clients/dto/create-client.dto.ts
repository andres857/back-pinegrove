import { IsNotEmpty, IsString, IsOptional, IsEmail, IsArray, IsUUID } from 'class-validator';
import { User } from 'src/entities/user.entity';
import { Location } from 'src/entities/location.entity';
import { SigfoxDevice } from 'src/entities/sigfox-device.entity';


export class CreateClientDto {
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsArray()
    users?: User[];

    @IsOptional()
    @IsArray()
    locations?: Location[];

    @IsOptional()
    @IsArray()
    devices?: SigfoxDevice[];
}
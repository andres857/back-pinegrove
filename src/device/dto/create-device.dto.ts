import { IsString, IsUUID, IsOptional, IsNumber, IsDate, Min, Max, IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSigfoxDeviceDto {
    // @IsString()
    // deviceId: string;

    @IsString()
    @IsNotEmpty({ message: 'SigfoxId is required' })
    SigfoxId: string;

    @IsString()
    @IsOptional()
    friendlyName?: string;

    @IsString()
    @IsOptional()
    aliasDeviceType?: string;

    @IsString()
    deviceType: string;

    @IsString()
    deviceTypeId: string;

    @IsNumber()
    @IsOptional()
    @Min(-90)
    @Max(90)
    lastLatitude?: number;

    @IsNumber()
    @IsOptional()
    @Min(-180)
    @Max(180)
    lastLongitude?: number;

    @IsDate()
    @IsOptional()
    lastLocationUpdate?: Date;

    @IsUUID()
    clientId: string;
}

export class UpdateSigfoxDeviceDto extends PartialType(CreateSigfoxDeviceDto) {}



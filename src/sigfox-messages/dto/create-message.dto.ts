import { IsString, IsArray, IsObject, IsNumber, IsNotEmpty, ValidateNested, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

class DuplicateDto {
    @IsString()
    @IsNotEmpty()
    bsId: string;

    @IsNumber()
    rssi: number;

    @IsNumber()
    nbRep: number;
}

class ComputedLocationDto {
    @IsNumber()
    lat: number;

    @IsNumber()
    lng: number;

    @IsNumber()
    radius: number;

    @IsNumber()
    source: number;

    @IsNumber()
    status: number;
}

export class CreateSigfoxMessageDto {

    @IsOptional()
    @IsString()
    deviceType?: string;

    @IsOptional()
    @IsString()
    deviceTypeId?: string;

    @IsOptional()
    @IsString()
    clientId?: string;

    @IsString()
    @IsNotEmpty()
    messageType: string;

    @IsString()
    @IsNotEmpty()
    data: string;

    @IsString()
    @IsNotEmpty()
    lqi: string;

    @IsString()
    @IsNotEmpty()
    linkQuality: string;

    @IsString()
    @IsNotEmpty()
    operatorName: string;

    @IsString()
    @IsNotEmpty()
    countryCode: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DuplicateDto)
    duplicates: DuplicateDto[];

    @IsObject()
    @ValidateNested()
    @Type(() => ComputedLocationDto)
    computedLocation: ComputedLocationDto;

    @IsString()
    @IsNotEmpty()
    device: string; // Para vincular el mensaje con un dispositivo
}

export class UpdateSigfoxMessageDto extends PartialType(CreateSigfoxMessageDto) {}
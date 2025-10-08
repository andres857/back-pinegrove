// create-location.dto.ts
import { IsString, IsNumber, IsUUID, IsOptional, Min, Max, IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLocationDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsOptional()
    province: string | null;

    @IsString()
    @IsOptional()
    microbs: string | null;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    zip: number | null;

    @IsNumber()
    @Min(-90)
    @Max(90)
    @Type(() => Number)
    latitude: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    @Type(() => Number)
    longitude: number;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    radiusMeters: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    index: number | null;

    @IsString()
    @IsOptional()
    notes: string | null;

    @IsNotEmpty()
    @IsUUID()
    clientId: string;
}
import { IsString, IsNumber, IsUUID, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateLocationDto {
    @IsString()
    name: string;

    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @IsNumber()
    @Min(0)
    radiusMeters: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNotEmpty()
    @IsUUID()
    clientId: string;
}
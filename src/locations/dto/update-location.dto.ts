import { CreateLocationDto } from "./create-location.dto";
import { IsString, IsNumber, IsUUID, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';

export class UpdateLocationDto implements Partial<Omit<CreateLocationDto, 'name'>> {
    @IsOptional()
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @IsOptional()
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    radiusMeters?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUUID()
    clientId?: string;
}
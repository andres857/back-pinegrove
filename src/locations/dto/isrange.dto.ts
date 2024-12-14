import { IsString, IsNumber, IsUUID, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';

class CoordinateDto {
    lat: number;
    lng: number;
}
  
export class RangeCheckDto {
    coordinate1: CoordinateDto;
    coordinate2: CoordinateDto;
    radius: number;
}
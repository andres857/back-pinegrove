import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Location } from 'src/entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) {}

    @Get()
    findAll(): Promise<Location[]> {
        return this.locationsService.findAll();
    }

    @Post()
    create(@Body() createLocationDto: CreateLocationDto): Promise<Location> {
        return this.locationsService.create(createLocationDto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto): Promise<Location> {
        return this.locationsService.update(id, updateLocationDto);
    }
}

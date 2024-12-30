import { Controller, Post, Body, Get, Param, Put,ParseUUIDPipe } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Location } from 'src/entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { RangeCheckDto } from './dto/isrange.dto';

@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) {}

    @Get()
    findAll(): Promise<Location[]> {
        return this.locationsService.findAll();
    }

    @Get('client/:id')
    findAllbyIdClient(@Param('id', new ParseUUIDPipe()) id: string): Promise<Location[]> {
        return this.locationsService.getLocationsByClientId(id);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Location> {
        return this.locationsService.findOne(id);
    }
    
    @Post()
    create(@Body() createLocationDto: CreateLocationDto): Promise<Location> {
        return this.locationsService.create(createLocationDto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto): Promise<Location> {
        return this.locationsService.update(id, updateLocationDto);
    }

    @Post('/isrange')
    isRange(@Body() rangeData: RangeCheckDto) {
        return this.locationsService.calculateDistance(
            rangeData.coordinate1,
            rangeData.coordinate2,
            rangeData.radius
        );
    }

    @Get('report/:id')
    async getReportData(@Param('id') id: string) {
        const report = await this.locationsService.generateReport(id);
        return report
    }
}

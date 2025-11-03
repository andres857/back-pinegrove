import { Controller, Post, Body, Get, Param, Put,ParseUUIDPipe, Res } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Location } from 'src/entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { RangeCheckDto } from './dto/isrange.dto';
import { Response } from 'express';

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
    
    @Post('bulk')
    async createBulk(@Body() createLocationDtos: CreateLocationDto[]): Promise<{
        created: Location[];
        errors: { index: number; name: string; error: string }[];
        summary: {
            total: number;
            successful: number;
            failed: number;
        };
    }> {
        const result = await this.locationsService.createBulk(createLocationDtos);
        
        return {
            ...result,
            summary: {
                total: createLocationDtos.length,
                successful: result.created.length,
                failed: result.errors.length
            }
        };
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

    @Get('reportold/:id')
    async getReportData(@Param('id') id: string) {
        const report = await this.locationsService.generateReport(id);
        return report
    }

    @Get('history/device/:id')
    async getLocation(@Param('id') id: string){
        const history = await this.locationsService.getHistoryLocationByDevice(id)
        return history;
    }

    @Get('report/:id')
    async getReport(@Param('id') id: string){
        const report = await this.locationsService.report(id);
        return report;
    }

    // Nuevo endpoint para CSV
    @Get('report/:idclient/download/csv')
    async downloadReportCSV(
        @Param('idclient') idclient: string,
        @Res() res: Response
    ) {
        return await this.locationsService.generateReportCSV(idclient, res);
    }

  // Nuevo endpoint para Excel
  @Get('report/:idclient/download/excel')
  async downloadReportExcel(
    @Param('idclient') idclient: string,
    @Res() res: Response
  ) {
    return await this.locationsService.generateReportExcel(idclient, res);
  }
}

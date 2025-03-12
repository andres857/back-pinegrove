import { Controller, Post, Body, Get, Param, Put, ParseUUIDPipe } from '@nestjs/common';
import { DeviceService } from './device.service';

import { SigfoxDevice } from 'src/entities/sigfox-device.entity';
import { CreateSigfoxDeviceDto, UpdateSigfoxDeviceDto } from 'src/device/dto/create-device.dto';

@Controller('devices')
export class DeviceController {
    constructor (private readonly deviceService:DeviceService ){}

    @Get()
    findAll(): Promise<SigfoxDevice[]>{
        return this.deviceService.findAll();
    }

    @Get('client/:id')
    findAllbyIdClient(@Param('id', new ParseUUIDPipe()) id: string): Promise<SigfoxDevice[]> {
        return this.deviceService.getDevicesByClientId(id);
    }

    @Get(':id')
    findOne(@Param('id') id:string ): Promise<SigfoxDevice>{
        return this.deviceService.findOne(id);
    }

    @Post()
    create(@Body() createSigfoxDeviceDto: CreateSigfoxDeviceDto): Promise<SigfoxDevice> {
        return this.deviceService.create(createSigfoxDeviceDto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateSigfoxDeviceDto: UpdateSigfoxDeviceDto): Promise<SigfoxDevice> {
        return this.deviceService.update(id, updateSigfoxDeviceDto);
    }
}

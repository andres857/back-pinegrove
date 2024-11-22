import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from 'src/entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientService: ClientsService) {}

    @Get()
    findAll(): Promise<Client[]> {
        return this.clientService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Client> {
        return this.clientService.findOne(id);
    }

    @Post()
    create(@Body() createClientDto: CreateClientDto): Promise<Client> {
        return this.clientService.create(createClientDto);
    }
}

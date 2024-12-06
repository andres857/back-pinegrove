import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from 'src/entities/location.entity';
import { Client } from "src/entities/client.entity";
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
    constructor(
        @InjectRepository(Location)
        private locationRepository: Repository<Location>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
    ) {}

    async findAll(): Promise<Location[]> {
        return await this.locationRepository.find({
            relations: ['client']
        });
    }
    
    async create(createLocationDto: CreateLocationDto): Promise<Location> {
        // Verificar si ya existe una location con el mismo nombre
        
        const existingLocation = await this.locationRepository.findOne({
            where: { name: createLocationDto.name }
        });

        if (existingLocation) {
            throw new ConflictException('location already exists');
        }

        const client = await this.clientRepository.findOne({
            where: { id: createLocationDto.clientId }
        });
        if (!client) {
            throw new NotFoundException(`Client with ID ${createLocationDto.clientId} not found`);
        }

        const location = this.locationRepository.create(createLocationDto);            
        return await this.locationRepository.save(location);
    }

    async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
        const location = await this.locationRepository.findOne({
            where: { id }
        });
    
        if (!location) {
            throw new NotFoundException(`Location with ID ${id} not found`);
        }
    
        Object.assign(location, updateLocationDto);
        return await this.locationRepository.save(location);
    }
}

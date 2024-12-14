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

    async getLocationsByClientId(clientId): Promise<Location[]> {
        const locations = await this.locationRepository.find({
          where: { clientId },
          relations: ['client'],
          order: { name: 'ASC' }
        });
    
        if (!locations.length) {
          throw new NotFoundException(`No locations found for client ${clientId}`);
        }
    
        return locations;
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

    async findOne(id: string): Promise<Location> {
        const location = await this.locationRepository.findOne({
            where: { id },
            relations: ['client'] // Including the client relation to get full client details
        });
    
        if (!location) {
            throw new NotFoundException(`Location with ID ${id} not found`);
        }
    
        return location;
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


    toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
  
    calculateDistance(coordinate1, coordinate2, radio): boolean {
        const earthRadius = 6371; // Radio de la Tierra en kilómetros
      
        // Convertir las coordenadas de grados a radianes
        const lat1Rad = this.toRadians(coordinate1.lat);
        const lat2Rad = this.toRadians(coordinate2.lat);
        const deltaLat = this.toRadians(coordinate2.lat - coordinate1.lat);
        const deltaLng = this.toRadians(coordinate2.lng - coordinate1.lng);
      
        // Calcular la fórmula de Haversine
        const a =
          Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c;
        // Verificar si la distancia está dentro del radio especificado
        return distance <= radio;
    }
}

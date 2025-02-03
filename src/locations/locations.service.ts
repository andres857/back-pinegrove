import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SigfoxMessagesService } from 'src/sigfox-messages/sigfox-messages.service';
import { DeviceService } from 'src/device/device.service';

import { Location } from 'src/entities/location.entity';
import { Client } from "src/entities/client.entity";
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { log } from 'console';


@Injectable()
export class LocationsService {

    constructor(
        @InjectRepository(Location)
        private locationRepository: Repository<Location>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        private readonly sigfoxMessagesService:SigfoxMessagesService,
        private readonly deviceService:DeviceService
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
        // console.log(`Distance: ${distance} km - Radio: ${radio/1000} km`);
        return distance <= radio/1000;
    }

    // Verificar el estado del dispositivo
    statusDevice = (dateString) => {
        const pastDate = new Date(dateString).getTime();
        const currentDate = new Date().getTime();
        const hoursDifference = (currentDate - pastDate) / (1000 * 60 * 60);
        return hoursDifference <= 48 ? 'Connected' : 'Disconnected';
    };

    async generateReport(id) {

        const devicesConnectedArrayTemp = new Map();
        let devicesConnectedArray = [];
        let devicesIntransitArray = [];
        let devicesNotSeenArray = [];
        let locationsEmptyArray = [];

        let locations = await this.getLocationsByClientId(id);
        let devices = await this.deviceService.getDevicesByClientId(id);

        // Obtener últimas ubicaciones de los dispositivos
        let lastUbicationsDevices = await Promise.all(
            devices.map(async (device) => {                                
                const lastMessage = await this.sigfoxMessagesService.getLatestMessage(device.deviceId);
                return {
                    id: device.deviceId,
                    duplicates: lastMessage.duplicates,
                    computedLocation: lastMessage.computedLocation,
                    lastseen: lastMessage.device.lastLocationUpdate,
                }
            })
        );

        // Obtener los dispositivos que se encuentren conectados
        let connectedDevices = lastUbicationsDevices.filter(device => {
            const status = this.statusDevice(device.lastseen);
            return status === 'Connected';
        });

        // evaluar si el dispositivo se encuentra en rango de alguna location
        connectedDevices.forEach(device => {
            let locationisEmpty = false;
            let isInAnyRange = false; // Flag to track if device is in range of any location
            const deviceCoordinates = {
                lat: Number(device.computedLocation.lat),
                lng: Number(device.computedLocation.lng)
            };

            locations.forEach(location => {
                const radio = Number(location.radiusMeters);
                
                const locationCoordinates = {
                    lat: Number(location.latitude),
                    lng: Number(location.longitude)
                };
                const isRange = this.calculateDistance(locationCoordinates, deviceCoordinates, radio);
                if (isRange) {
                    isInAnyRange = true;
                    locationisEmpty = false;

                    // Si esta ubicación no está en el Map, la inicializamos
                    if (!devicesConnectedArrayTemp.has(location.id)) {
                        devicesConnectedArrayTemp.set(location.id, {
                            index: location.index,
                            location: location.name,
                            mbs: location.microbs,
                            associated_devices: 0,
                            id_location: location.id,
                            city: location.city,
                            province: location.province,
                            address: location.address,
                            radius: location.radiusMeters,
                            devices: []
                        });
                    }

                    const locationData = devicesConnectedArrayTemp.get(location.id);
                    locationData.associated_devices++;
                    locationData.devices.push(device.id);
                    return; 
                }
            });

            devicesConnectedArray = Array.from(devicesConnectedArrayTemp.values());

            // Determinar si el dispositivo se encuentra en la ubicación "In transit"
            if (!isInAnyRange) {
                const inTransitLocation = locations.find(location => location.name === 'In transit');
                if (!devicesIntransitArray.length) {
                    devicesIntransitArray = [{
                        index: inTransitLocation.index,
                        location: inTransitLocation.name,
                        mbs: inTransitLocation.microbs,
                        associated_devices: 0,
                        id_location: inTransitLocation.id,
                        city: inTransitLocation.city,
                        province: inTransitLocation.province,
                        address: inTransitLocation.address,
                        radius: inTransitLocation.radiusMeters,
                        devices: []
                    }];
                }
                devicesIntransitArray[0].devices.push(device.id);
                devicesIntransitArray[0].associated_devices++;
            }
        });

        // Obtener los dispositivos que se encuentren desconectados
        let disconnectedDevices = lastUbicationsDevices.filter(device => {
            const status = this.statusDevice(device.lastseen);
            return status === 'Disconnected';
        });
        
        const notSeenLocation = locations.find(location => location.name === 'Not Seen');
        
        // Creamos el objeto locationProperties una sola vez
        const locationProperties = {
            index: notSeenLocation ? notSeenLocation.index : null,
            location: 'Not Seen',
            mbs: notSeenLocation ? notSeenLocation.microbs : null,
            associated_devices: 0,
            id_location: notSeenLocation ? notSeenLocation.id : null,
            city: notSeenLocation ? notSeenLocation.city : null,
            province: notSeenLocation ? notSeenLocation.province : null,
            address: notSeenLocation ? notSeenLocation.address : null,
            radius: notSeenLocation ? notSeenLocation.radiusMeters : 0,
            devices: [] // Este array almacenará todos los IDs
        };

        disconnectedDevices.forEach(device => {
            locationProperties.associated_devices++;
            locationProperties.devices.push(device.id);
        });

        devicesNotSeenArray = [locationProperties];

        // Obtener las locations que no tienen dispositivos asociados
        const locationsWithDevices = new Set(devicesConnectedArrayTemp.keys());
        const emptyLocations = locations.filter(location => {
            // Excluimos ubicaciones especiales como "In Transit" o "Not Seen"
            const isSpecialLocation = location.name === 'In Transit' || location.name === 'Not Seen';
            return !isSpecialLocation && !locationsWithDevices.has(location.id);
        });

        function formatLocationStructure(location) {
            return {
                index: location.index,
                location: location.name,        // Nota que usamos 'name' del objeto original
                mbs: location.microbs,          // Y 'microbs' del original
                associated_devices: 0,          // Siempre 0 para ubicaciones vacías
                id_location: location.id,       // 'id' del original
                city: location.city,
                province: location.province,
                address: location.address,
                radius: location.radiusMeters,  // 'radiusMeters' del original
                devices: []                     // Siempre array vacío
            };
        }
        
        // Aplicamos el formato a todas las ubicaciones vacías
        const formattedEmptyLocations = emptyLocations.map(formatLocationStructure);

        // Consolidar los arrays
        const consolidatedArray = [
            ...devicesConnectedArray,
            ...devicesIntransitArray,
            ...devicesNotSeenArray,
            ...formattedEmptyLocations
        ];
        return consolidatedArray
    }
}
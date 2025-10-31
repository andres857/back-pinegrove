import { Repository } from 'typeorm';
import { ConflictException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeviceService } from 'src/device/device.service';
import { SigfoxDevice } from 'src/entities/sigfox-device.entity';
import { LocationsService } from 'src/locations/locations.service';

import { SigfoxMessage } from 'src/entities/sigfox-message.entity';
import { CreateSigfoxMessageDto } from './dto/create-message.dto';
import { CreateSigfoxDeviceDto } from 'src/device/dto/create-device.dto';

import { DeviceLocationHistory } from 'src/entities/device-location-history.entity';

@Injectable()
export class SigfoxMessagesService {
    constructor(
        @InjectRepository(SigfoxMessage)
        private sigfoxMessageRepository: Repository<SigfoxMessage>,
        @InjectRepository(SigfoxDevice)
        private sigfoxDeviceRepository: Repository<SigfoxDevice>,
        private readonly deviceService:DeviceService,
        // @InjectRepository(LocationsService)
        @Inject(forwardRef(() => LocationsService))
        private locationsServiceRepository:LocationsService,
        
        @InjectRepository(DeviceLocationHistory)
        private deviceLocationHistoryRepository: Repository<DeviceLocationHistory>
    ){}

    async findAll(): Promise<SigfoxMessage[]> {
        return await this.sigfoxMessageRepository.find({
            relations: ['device'],
            order: {
                createdAt: 'DESC', // Ordenamos por fecha de creación, más recientes primero
            },
        });
    }

    async findAllHistoryLocation(): Promise<DeviceLocationHistory[]> {
        return await this.deviceLocationHistoryRepository.find({
            relations: ['device', 'location'], // Incluimos también la relación con 'location'
            order: {
                timestamp: 'DESC', 
            },
            take: 100,
        });
    }

    async findHistoryLocationByDevice(deviceId: string) {
        return await this.deviceLocationHistoryRepository.find({
            where: {
                device: { deviceId }
            },
            relations: ['device', 'location'],
            order: {
                timestamp: 'DESC'
            },
            take: 100 // Limitamos para evitar sobrecarga
        });
    }

    async getMessagesByDeviceId(deviceId: string): Promise<SigfoxMessage[]> {
        const messages = await this.sigfoxMessageRepository.find({
            where: { device: { deviceId } },
            relations: ['device'],
            order: { createdAt: 'DESC' }
        });
        if (!messages.length) {
            throw new NotFoundException(`No messages found for device ${deviceId}`);
        }
        return messages;
    }

    async getLatestMessage(deviceId): Promise<SigfoxMessage> {
        const message = await this.sigfoxMessageRepository.findOne({
            where: { device: { deviceId } },
            relations: ['device'],
            order: { createdAt: 'DESC' }
        });
        if (!message) {
            throw new NotFoundException(`No messages found for device ${deviceId}`);
        }    
        return message;
    }

    async create(createMessageDto: CreateSigfoxMessageDto): Promise<SigfoxMessage> {        
        const idLocationInstransit = '1432658f-06ad-45fb-8ce9-6745f1bb35f1'
        const clientId = createMessageDto.clientId;
        console.log('clientId', clientId);

        const {lat, lng} = createMessageDto.computedLocation;
        
        const coordinates = {
            lat:lat,
            lng:lng
        }
        
        const locationFound  = await this.locationsServiceRepository.getLocation(clientId, coordinates, createMessageDto.duplicates )
        console.log('[SIGFOX-MESSAGES-SERVICE] - LOCATION', locationFound);

        if (idLocationInstransit === locationFound.id){
            locationFound.latitude = lat;
            locationFound.longitude = lng;
        }
        
        try {
            let device = await this.sigfoxDeviceRepository.findOne({
                where: { SigfoxId: createMessageDto.device }
            });
    
            // Si el dispositivo no existe, se crea
            if (!device) {
                const createDeviceDto: CreateSigfoxDeviceDto = {
                    SigfoxId: createMessageDto.device,
                    clientId: createMessageDto.clientId,
                    deviceType: createMessageDto.deviceType,
                    deviceTypeId: createMessageDto.deviceTypeId,
                    lastLatitude: locationFound.latitude,
                    lastLongitude: locationFound.longitude,
                    lastLocationUpdate: new Date(),
                };
                device = await this.deviceService.create(createDeviceDto);
                console.log('[SIGFOX-MESSAGES-SERVICE] - DEVICE CREADO', device );
                
            } else {
                if (createMessageDto.computedLocation) {
                    await this.deviceService.update(createMessageDto.device, {
                        lastLatitude: locationFound.latitude,
                        lastLongitude: locationFound.longitude,
                        lastLocationUpdate: new Date(),
                    });
                }
            }
    
            // Creamos una nueva instancia del mensaje con los datos recibidos
            const sigfoxMessage = this.sigfoxMessageRepository.create({
                messageType: createMessageDto.messageType,
                data: createMessageDto.data,
                lqi: createMessageDto.lqi,
                linkQuality: createMessageDto.linkQuality,
                operatorName: createMessageDto.operatorName,
                countryCode: createMessageDto.countryCode,
                duplicates: createMessageDto.duplicates,
                computedLocation: createMessageDto.computedLocation,
                device: device // Asignamos el dispositivo encontrado
            });
            
            const newMessage = await this.sigfoxMessageRepository.save(sigfoxMessage);
            console.log('[SIGFOX-MESSAGES-SERVICE] - foundddddddddddd', locationFound);
            
            await this.createLocationRecord(locationFound,device);
            return newMessage;
        } catch (error) {
            console.error('Error al crear el mensaje del callback de sigfox: ', error);
        }
    }

    async createLocationRecord(location, device){
        try {            
            // Crear un nuevo registro de historial de ubicación
            const locationHistory = this.deviceLocationHistoryRepository.create({
                latitude: location.latitude,
                longitude: location.longitude,
                locationName: location.name,
                device: device,
                location: location,
                duplicates: location.microbs,
            });
            console.log('locationHistoryyyyyyyyyyyyyyyyyyyyyyyyyyy', locationHistory);
            
            const savedHistory = await this.deviceLocationHistoryRepository.save(locationHistory);
            console.log('Historial de ubicación guardado:', savedHistory);
            return savedHistory;  
        } catch (error) {
            console.error('Error al crear el registro de historial de ubicación:', error);
        }
    }    
}

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
        // Primero verificamos que el dispositivo al que se asociará el mensaje existe
        try {
            let device = await this.sigfoxDeviceRepository.findOne({
                where: { SigfoxId: createMessageDto.device }
            });
    
            // Si no encontramos el dispositivo, lo creamos
            if (!device) {
                console.log('CREANDO NUEVO DEVICE');
                
                const createDeviceDto: CreateSigfoxDeviceDto = {
                    SigfoxId: createMessageDto.device,
                    deviceType: createMessageDto.deviceType,
                    deviceTypeId: createMessageDto.deviceTypeId,
                    clientId: createMessageDto.clientId,
    
                    // Actualizamos la ubicación si está disponible
                    lastLatitude: createMessageDto.computedLocation?.lat,
                    lastLongitude: createMessageDto.computedLocation?.lng,
                    lastLocationUpdate: new Date(),
                };
                console.log("*****",createDeviceDto );
                device = await this.deviceService.create(createDeviceDto);
                
            } else {
                if (createMessageDto.computedLocation) {
                    await this.deviceService.update(createMessageDto.device, {
                        lastLatitude: createMessageDto.computedLocation.lat,
                        lastLongitude: createMessageDto.computedLocation.lng,
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
            await this.createLocationRecord(newMessage);
            return newMessage;
        } catch (error) {
            console.error('Error al crear el mensaje del callback de sigfox: ', error);
        }

    }

    async createLocationRecord(newMessage){
        const {lat, lng} = newMessage.computedLocation;
        console.log('ANTENASSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',newMessage.duplicates);
        
        const coordinates = {
            lat:lat,
            lng:lng
        }
        
        // hardcore id client FIXX THIS, later 
        const clientID = 'e8a53dfb-bd89-4419-9602-414bea118aae';

        try {
            const location = await this.locationsServiceRepository.getLocation(clientID, coordinates,newMessage.duplicates )
            console.log('aqqqqqqqqqqqqqqqqqqq', location);
            
            // Crear un nuevo registro de historial de ubicación
            const locationHistory = this.deviceLocationHistoryRepository.create({
                latitude: lat,
                longitude: lng,
                locationName: location.name,
                device: newMessage.device,
                location: location 
            });
    
            const savedHistory = await this.deviceLocationHistoryRepository.save(locationHistory);
            // console.log('Historial de ubicación guardado:', savedHistory.id);
            return savedHistory;  
        } catch (error) {
            console.error('Error al crear el registro de historial de ubicación:', error);
            // throw error;
        }
    }
    
}

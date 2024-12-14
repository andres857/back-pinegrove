import { Repository } from 'typeorm';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceService } from 'src/device/device.service';
import { SigfoxDevice } from 'src/entities/sigfox-device.entity';

import { SigfoxMessage } from 'src/entities/sigfox-message.entity';
import { CreateSigfoxMessageDto } from './dto/create-message.dto';
import { CreateSigfoxDeviceDto } from 'src/device/dto/create-device.dto';

@Injectable()
export class SigfoxMessagesService {
    constructor(
        @InjectRepository(SigfoxMessage)
        private sigfoxMessageRepository: Repository<SigfoxMessage>,
        @InjectRepository(SigfoxDevice)
        private sigfoxDeviceRepository: Repository<SigfoxDevice>,
        private readonly deviceService:DeviceService 
    ){}

    async findAll(): Promise<SigfoxMessage[]> {
        return await this.sigfoxMessageRepository.find({
            relations: ['device'],
            order: {
                createdAt: 'DESC', // Ordenamos por fecha de creación, más recientes primero
            },
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
        let device = await this.sigfoxDeviceRepository.findOne({
            where: { SigfoxId: createMessageDto.device }
        });

        // Si no encontramos el dispositivo, lo creamos
        if (!device) {
            console.log('CREANDO NUEVO DEVICE');
            
            const createDeviceDto: CreateSigfoxDeviceDto = {
                // deviceId: createMessageDto.device,
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

        // Guardamos el mensaje en la base de datos
        return await this.sigfoxMessageRepository.save(sigfoxMessage);
    }
}

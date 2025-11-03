import { Repository } from 'typeorm';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SigfoxDevice } from 'src/entities/sigfox-device.entity';
import { CreateSigfoxDeviceDto, UpdateSigfoxDeviceDto } from './dto/create-device.dto';
import { ClientsService } from 'src/clients/clients.service';

import { SigfoxMessage } from 'src/entities/sigfox-message.entity';
import { Location } from 'src/entities/location.entity';
import { DeviceLocationHistory } from 'src/entities/device-location-history.entity';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(SigfoxDevice)
        private sigfoxDeviceRepository: Repository<SigfoxDevice>,
        @InjectRepository(SigfoxMessage)
        private sigfoxMessageRepository: Repository<SigfoxMessage>,
        @InjectRepository(Location)
        private locationRepository: Repository<Location>,
        @InjectRepository(DeviceLocationHistory)
        private deviceLocationHistoryRepository: Repository<DeviceLocationHistory>,
        private readonly clientService: ClientsService

    ){}

    async create(createSigfoxDeviceDto: CreateSigfoxDeviceDto): Promise<SigfoxDevice> {  

        const existingSigFoxDevice = await this.sigfoxDeviceRepository.findOne({
            where: { SigfoxId: createSigfoxDeviceDto.SigfoxId }
        });

        if (existingSigFoxDevice) {
            throw new ConflictException('device already exists');
        }

        // const client = await this.clientRepository.findOne({
        //     where: { id: createSigfoxDeviceDto.clientId }
        // });

        const client = await this.clientService.findOne(createSigfoxDeviceDto.clientId)
        
        if (!client) {
            throw new NotFoundException('Client not found');
        }

        createSigfoxDeviceDto.lastLocationUpdate = new Date();
        
        // Creamos el dispositivo con la relación
        const sigfoxDevice = this.sigfoxDeviceRepository.create({
            ...createSigfoxDeviceDto,
            client // Asignamos el objeto client completo, no solo el ID
        });
        
        return await this.sigfoxDeviceRepository.save(sigfoxDevice);

    }

    async update(sigfoxId: string, updateSigfoxDeviceDto: UpdateSigfoxDeviceDto): Promise<SigfoxDevice> {
        
        // Primero verificamos que el dispositivo existe
        const existingDevice = await this.sigfoxDeviceRepository.findOne({
            where: { SigfoxId: sigfoxId },
            relations: ['client'] // Incluimos la relación con el cliente si es necesaria
        });
    
        if (!existingDevice) {
            throw new NotFoundException('Device not found');
        }
    
        // Si se está intentando actualizar el SigfoxId, verificamos que no exista otro dispositivo con ese ID
        if (updateSigfoxDeviceDto.SigfoxId && updateSigfoxDeviceDto.SigfoxId !== existingDevice.SigfoxId) {
            const deviceWithSameId = await this.sigfoxDeviceRepository.findOne({
                where: { SigfoxId: updateSigfoxDeviceDto.SigfoxId }
            });
    
            if (deviceWithSameId) {
                throw new ConflictException('A device with this Sigfox ID already exists');
            }
        }
    
        // Actualizamos solo los campos proporcionados en el DTO
        Object.assign(existingDevice, updateSigfoxDeviceDto);
    
        // Si se proporciona un nuevo clientId, actualizamos la relación
        if (updateSigfoxDeviceDto.clientId) {

            // const client = await this.clientRepository.findOne({
            //     where: { id: updateSigfoxDeviceDto.clientId }
            // });
            const client = await this.clientService.findOne(updateSigfoxDeviceDto.clientId)

            if (!client) {
                throw new NotFoundException('Client not found');
            }
            existingDevice.client = client;
        }
        return await this.sigfoxDeviceRepository.save(existingDevice);
    }

    async findAll(): Promise<SigfoxDevice[]> {
        // Solo carga los devices con el cliente
        const devices = await this.sigfoxDeviceRepository.find({
            relations: ['client'],
            order: {
                friendlyName: 'ASC'
            },
            take: 20
        });

        // Carga los últimos 100 mensajes para cada device (si realmente los necesitas)
        for (const device of devices) {
            device.messages = await this.sigfoxMessageRepository.find({
                where: { device: { deviceId: device.deviceId } },
                order: { createdAt: 'DESC' },
                take: 5
            });
            
            device.locationHistory = await this.deviceLocationHistoryRepository.find({
                where: { device: { deviceId: device.deviceId } },
                order: { timestamp: 'DESC' },
                take: 5
            });
        }

        return devices;
    }

    async getDevicesByClientId(clientId): Promise<SigfoxDevice[]> {
        const devices = await this.sigfoxDeviceRepository.find({
            where: { client: { id: clientId } },
            relations: ['client'],
            order: { friendlyName: 'ASC' }
        });
    
        if (!devices.length) {
            throw new NotFoundException(`No devices found for client ${clientId}`);
        }
    
        return devices;
    }
    
    async findOne(id: string): Promise<SigfoxDevice> {
        const device = await this.sigfoxDeviceRepository.findOne({
            where: { deviceId: id },
            relations: ['client', 'messages', 'locationHistory']
        });

        if (!device) {
            throw new NotFoundException(`Device with ID ${id} not found`);
        }

        return device;
    }

    async getLastLocation(deviceId: string): Promise<DeviceLocationHistory | null> {
        const locationHistory = await this.deviceLocationHistoryRepository.findOne({
          where: { device: { deviceId } },
          order: { timestamp: 'DESC' },
          relations: ['device']
        });
    
        return locationHistory;
    }

    async getCountDevicesByClientId(clientId): Promise<number> {
        return await this.sigfoxDeviceRepository.count({
            where: { client: { id: clientId } }
        });
    }
}

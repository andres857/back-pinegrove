import { Repository } from 'typeorm';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { SigfoxDevice } from 'src/entities/sigfox-device.entity';
import { CreateSigfoxDeviceDto, UpdateSigfoxDeviceDto } from './dto/create-device.dto';

import { Client } from 'src/entities/client.entity';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(SigfoxDevice)
        private sigfoxDeviceRepository: Repository<SigfoxDevice>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>
    ){}

    async create(createSigfoxDeviceDto: CreateSigfoxDeviceDto): Promise<SigfoxDevice> {  

        const existingSigFoxDevice = await this.sigfoxDeviceRepository.findOne({
            where: { SigfoxId: createSigfoxDeviceDto.SigfoxId }
        });

        if (existingSigFoxDevice) {
            throw new ConflictException('device already exists');
        }

        const client = await this.clientRepository.findOne({
            where: { id: createSigfoxDeviceDto.clientId }
        });
    
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
            const client = await this.clientRepository.findOne({
                where: { id: updateSigfoxDeviceDto.clientId }
            });
            if (!client) {
                throw new NotFoundException('Client not found');
            }
            existingDevice.client = client;
        }
    
        // Guardamos los cambios en la base de datos
        return await this.sigfoxDeviceRepository.save(existingDevice);
    }

    async findAll(): Promise<SigfoxDevice[]> {
        return await this.sigfoxDeviceRepository.find({
            relations: ['client', 'messages', 'locationHistory'],
            order: {
                friendlyName: 'ASC'
            }
        });
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
}

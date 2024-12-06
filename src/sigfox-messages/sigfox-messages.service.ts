import { Repository } from 'typeorm';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SigfoxDevice } from 'src/entities/sigfox-device.entity';

import { SigfoxMessage } from 'src/entities/sigfox-message.entity';
import { CreateSigfoxMessageDto } from './dto/create-message.dto';


@Injectable()
export class SigfoxMessagesService {
    constructor(
        @InjectRepository(SigfoxMessage)
        private sigfoxMessageRepository: Repository<SigfoxMessage>,
        @InjectRepository(SigfoxDevice)
        private sigfoxDeviceRepository: Repository<SigfoxDevice>
    ){}

    async findAll(): Promise<SigfoxMessage[]> {
        // Realizamos una consulta que incluye la relación con el dispositivo
        // Esto nos permite acceder a la información del dispositivo asociado a cada mensaje
        return await this.sigfoxMessageRepository.find({
            relations: ['device'],
            order: {
                createdAt: 'DESC', // Ordenamos por fecha de creación, más recientes primero
            },
        });
    }

    async create(createMessageDto: CreateSigfoxMessageDto): Promise<SigfoxMessage> {
        // Primero verificamos que el dispositivo al que se asociará el mensaje existe
        const device = await this.sigfoxDeviceRepository.findOne({
            where: { SigfoxId: createMessageDto.device }
        });

        // Si no encontramos el dispositivo, lanzamos una excepción
        if (!device) {
            throw new NotFoundException(
                `No se encontró el dispositivo con ID ${createMessageDto.device}`
            );
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

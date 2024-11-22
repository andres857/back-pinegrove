import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from 'src/entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {

    constructor(
        @InjectRepository(Client)
        private clientRepository: Repository<Client>
    ) {}

    async create(createClientDto: CreateClientDto): Promise<Client> {
        // Verificar si ya existe un rol con el mismo nombre
        const existingClient = await this.clientRepository.findOne({
            where: { name: createClientDto.name }
        });

        if (existingClient) {
            throw new ConflictException('client already exists');
        }
        
        // Crear nuevo client
        const client = this.clientRepository.create(createClientDto);
        return await this.clientRepository.save(client);
    }

    async findAll(): Promise<Client[]> {
        return await this.clientRepository.find();
    }

    async findOne(id: string): Promise<Client> {
        return await this.clientRepository.findOneBy({ id });
    }
}

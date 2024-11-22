import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>
    ) {}

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        // Verificar si ya existe un rol con el mismo nombre
        const existingRole = await this.roleRepository.findOne({
            where: { name: createRoleDto.name }
        });

        if (existingRole) {
            throw new ConflictException('Role name already exists');
        }
        
        // Crear nuevo rol
        const role = this.roleRepository.create(createRoleDto);
        return await this.roleRepository.save(role);
    }

    async findAll(): Promise<Role[]> {
        return await this.roleRepository.find();
    }

    async findOne(id: string): Promise<Role> {
        return await this.roleRepository.findOneBy({ id });
    }
}

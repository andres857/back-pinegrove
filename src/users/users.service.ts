import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { Client} from 'src/entities/client.entity';
import { Role } from 'src/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        // Verificar si ya existe un rol con el mismo nombre
        console.log(createUserDto.password);
        
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email }
        });

        if (existingUser) {
            throw new ConflictException('user already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        console.log(hashedPassword);
        
        // Crear nuevo usuario
        const user = new User();
        user.email = createUserDto.email;
        user.password = hashedPassword;
        user.firstName = createUserDto.firstName;
        user.lastName = createUserDto.lastName;

        // Si se proporciona un clientId, buscar y asignar el cliente
        if (createUserDto.clientId) {
            const client = await this.clientRepository.findOne({
                where: { id: createUserDto.clientId }
            });
            if (!client) {
                throw new NotFoundException(`Client with ID ${createUserDto.clientId} not found`);
            }
            user.client = client;
        }

        // Buscar y asignar el rol
        const role = await this.roleRepository.findOne({
            where: { id: createUserDto.roleId }
        });
        if (!role) {
            throw new NotFoundException(`Role with ID ${createUserDto.roleId} not found`);
        }
        user.role = role;

        return await this.userRepository.save(user);
    }

    // async findAll(): Promise<User> {
    //     return await this.userRepository.find();
    // }

}

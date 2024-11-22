import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from '../entities/role.entity';


@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Get()
    findAll(): Promise<Role[]> {
        return this.rolesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Role> {
        return this.rolesService.findOne(id);
    }

    @Post()
    create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
        return this.rolesService.create(createRoleDto);
    }
}

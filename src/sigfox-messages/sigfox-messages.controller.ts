import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { SigfoxMessagesService } from './sigfox-messages.service';

import { CreateSigfoxMessageDto } from './dto/create-message.dto';
import { SigfoxMessage } from 'src/entities/sigfox-message.entity';

@Controller('sigfox-messages')
export class SigfoxMessagesController {
    constructor (private readonly sigfoxMessagesService:SigfoxMessagesService ){}

    @Get()
    async findAll(): Promise<SigfoxMessage[]>{
        return await this.sigfoxMessagesService.findAll();
    }

    @Get('/device/:id')
    async findOne(@Param('id') id: string): Promise<SigfoxMessage[]> {
        return await this.sigfoxMessagesService.getMessagesByDeviceId(id);
    }

    @Get('/device/:id/last')
    async findLastMessage(@Param('id') id: string): Promise<SigfoxMessage> {
        return await this.sigfoxMessagesService.getLatestMessage(id);
    }

    @Post()
    async create(@Body() createSigfoxMessageDto: CreateSigfoxMessageDto): Promise<SigfoxMessage> {
        return await this.sigfoxMessagesService.create(createSigfoxMessageDto);
    }
}

import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { SigfoxMessagesService } from './sigfox-messages.service';

import { CreateSigfoxMessageDto } from './dto/create-message.dto';
import { SigfoxMessage } from 'src/entities/sigfox-message.entity';

@Controller('sigfox-messages')
export class SigfoxMessagesController {
    constructor (private readonly sigfoxMessagesService:SigfoxMessagesService ){}

    @Get()
    findAll(): Promise<SigfoxMessage[]>{
        return this.sigfoxMessagesService.findAll();
    }

    @Post()
    create(@Body() createSigfoxMessageDto: CreateSigfoxMessageDto): Promise<SigfoxMessage> {
        return this.sigfoxMessagesService.create(createSigfoxMessageDto);
    }
}

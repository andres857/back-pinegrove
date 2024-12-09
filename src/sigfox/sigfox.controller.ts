import { Controller, Get, Query, Body, Post } from '@nestjs/common';
import { SigfoxMessagesService } from 'src/sigfox-messages/sigfox-messages.service';

import { CreateSigfoxMessageDto } from 'src/sigfox-messages/dto/create-message.dto';
import { SigfoxMessage } from 'src/entities/sigfox-message.entity';

interface SigfoxCallbackDto {
    messageType: string;
    deviceType: string;
    device: string;
    data: string;
    lqi: string;
    linkQuality: string;
    operatorName: string;
    countryCode: string;
    deviceTypeId: string;
    duplicates: any;
    computedLocation: any;
}

interface SigfoxQueryParams {
    time: string;
    seqNumber: string;
}

// Interface para la respuesta a Sigfox
interface SigfoxResponse {
    deviceId: string;
    downlinkData?: string;
    ack: boolean;
}


@Controller('sigfox')
export class SigfoxController {
    constructor (private readonly sigfoxMessagesService:SigfoxMessagesService ){}

    @Post('manitou/callback')
    async create(@Body() createSigfoxMessageDto: CreateSigfoxMessageDto, @Query() queryParams: SigfoxQueryParams) {
        const device =  await this.sigfoxMessagesService.create(createSigfoxMessageDto);
        // Preparar respuesta para Sigfox
        const response: SigfoxResponse = {
            deviceId: createSigfoxMessageDto.device,
            ack: true  // Confirmación de que recibimos el mensaje correctamente
        };
        console.log('Sending response to Sigfox:', response);
        return response;
    }
}

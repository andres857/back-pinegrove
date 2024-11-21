import { Controller, Get, Query, Body, Post } from '@nestjs/common';

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
    @Post('manitou/callback')
    async handleCallback(
        @Query() queryParams: SigfoxQueryParams,
        @Body() body: SigfoxCallbackDto,
    ): Promise<SigfoxResponse> {
        console.log('Received Sigfox callback oks:');
        console.log('Query Params:', queryParams);
        console.log('Body:', body);
        try {
            // Log detallado de cada campo importante
            console.log(`Time: ${queryParams.time}`);
            console.log(`Sequence Number: ${queryParams.seqNumber}`);
            console.log(`Device Type: ${body.deviceType}`);
            console.log(`Device: ${body.device}`);
            console.log(`Data: ${body.data}`);
            console.log(`Link Quality: ${body.linkQuality}`);
            console.log(`Operator: ${body.operatorName}`);
            console.log(`Country: ${body.countryCode}`);

            // Preparar respuesta para Sigfox
            const response: SigfoxResponse = {
                deviceId: body.device,
                // Datos downlink opcionales (8 bytes máximo en hexadecimal)
                // downlinkData: "0102030405060708", // Ejemplo de datos downlink
                ack: true  // Confirmación de que recibimos el mensaje correctamente
            };

            console.log('Sending response to Sigfox:', response);
            return response;

        } catch (error) {
            console.error('Error processing Sigfox callback:', error);
            throw error;
        }
  }
}
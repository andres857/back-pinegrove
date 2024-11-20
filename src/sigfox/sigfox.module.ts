import { Module } from '@nestjs/common';
import { SigfoxController } from './sigfox.controller'

@Module({
    controllers: [ SigfoxController ]
})
export class SigfoxModule {}

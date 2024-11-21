// src/entities/sigfox-message.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { SigfoxDevice } from './sigfox-device.entity';

@Entity()
export class SigfoxMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    messageType: string;

    @Column()
    data: string;

    @Column()
    lqi: string;

    @Column()
    linkQuality: string;

    @Column()
    operatorName: string;

    @Column()
    countryCode: string;

    @Column('json')
    duplicates: Array<{
        bsId: string;
        rssi: number;
        nbRep: number;
    }>;

    @Column('json')
    computedLocation: {
        lat: number;
        lng: number;
        radius: number;
        source: number;
        status: number;
    };

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => SigfoxDevice, device => device.messages)
    device: SigfoxDevice;
}
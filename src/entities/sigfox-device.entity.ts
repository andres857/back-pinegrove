// src/entities/sigfox-device.entity.ts
import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne } from 'typeorm';
import { SigfoxMessage } from './sigfox-message.entity';
import { Client } from './client.entity';
import { DeviceLocationHistory } from './device-location-history.entity';

@Entity()
export class SigfoxDevice {
    @PrimaryColumn()
    deviceId: string;

    @Column({ nullable: true })
    friendlyName: string;

    @Column()
    deviceType: string;

    @Column()
    deviceTypeId: string;

    @Column('decimal', { precision: 10, scale: 8, nullable: true })
    lastLatitude: number;

    @Column('decimal', { precision: 11, scale: 8, nullable: true })
    lastLongitude: number;

    @Column({ type: 'timestamp', nullable: true })
    lastLocationUpdate: Date;

    @ManyToOne(() => Client, client => client.devices)
    client: Client;

    @OneToMany(() => SigfoxMessage, message => message.device)
    messages: SigfoxMessage[];

    @OneToMany(() => DeviceLocationHistory, history => history.device)
    locationHistory: DeviceLocationHistory[];
}
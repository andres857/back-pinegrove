// src/entities/sigfox-device.entity.ts
import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { SigfoxMessage } from './sigfox-message.entity';
import { Client } from './client.entity';
import { DeviceLocationHistory } from './device-location-history.entity';

@Entity()
export class SigfoxDevice {
    @PrimaryGeneratedColumn('uuid')
    deviceId: string;

    @Column({ nullable: true })
    friendlyName: string;

    @Column( { 
        unique: true, 
        nullable: false, // No permite valores nulos
        name: 'sigfox_id' // Nombre personalizado en la base de datos
    })
    SigfoxId: string;

    @Column()
    deviceType: string; // devicetype sigfox

    @Column()
    deviceTypeId: string;

    @Column({ nullable: true })
    aliasDeviceType?: string; //Device type for web

    @Column('decimal', { precision: 10, scale: 8, nullable: true })
    lastLatitude: number;

    @Column('decimal', { precision: 11, scale: 8, nullable: true })
    lastLongitude: number;

    @Column({ type: 'timestamp', nullable: true })
    lastLocationUpdate: Date;

    @ManyToOne(() => Client, client => client.devices)
    @JoinColumn({ name: 'clientId' })  // Especifica el nombre exacto
    client: Client;

    @OneToMany(() => SigfoxMessage, message => message.device)
    messages: SigfoxMessage[];

    @OneToMany(() => DeviceLocationHistory, history => history.device)
    locationHistory: DeviceLocationHistory[];
}
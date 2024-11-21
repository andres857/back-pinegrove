// src/entities/location.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Client } from './client.entity';

@Entity()
export class Location {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column('decimal', { precision: 10, scale: 8 })
    latitude: number;

    @Column('decimal', { precision: 11, scale: 8 })
    longitude: number;

    @Column('integer')
    radiusMeters: number;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => Client, client => client.locations)
    client: Client;
}
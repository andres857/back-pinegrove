// src/entities/location.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
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

    // @ManyToOne(() => Client, client => client.locations)
    // client: Client;
        // This creates the relationship but allows you to access just the ID
    @Column({ nullable: true })
    clientId: string;  // This stores the actual client ID in the database

    @ManyToOne(() => Client)
    @JoinColumn({ name: 'clientId' }) // This tells TypeORM to use clientId as the foreign key
    client: Client;
}
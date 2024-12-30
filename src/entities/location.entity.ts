import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from './client.entity';

@Entity()
export class Location {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true})
    index: number;
    
    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    province: string;

    @Column({ nullable: true })
    microbs: string;

    @Column({ nullable: true })
    zip: number;

    @Column('decimal', { precision: 10, scale: 8 })
    latitude: number;

    @Column('decimal', { precision: 11, scale: 8 })
    longitude: number;

    @Column('integer')
    radiusMeters: number;

    @Column({ nullable: true })
    notes: string;

    // @ManyToOne(() => Client, client => client.locations)
    // client: Client;
        // This creates the relationship but allows you to access just the ID
    @Column({ nullable: true })
    clientId: string;  // This stores the actual client ID in the database

    @ManyToOne(() => Client)
    @JoinColumn({ name: 'clientId' }) // This tells TypeORM to use clientId as the foreign key
    client: Client;
}
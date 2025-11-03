import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { SigfoxDevice } from './sigfox-device.entity';
import { Location } from './location.entity';

@Entity()
export class DeviceLocationHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'varchar', nullable: true})
    duplicates: string | null;

    @Column('decimal', { precision: 10, scale: 8 })
    latitude: number;

    @Column('decimal', { precision: 11, scale: 8 })
    longitude: number;

    @Column({ nullable: true, name: 'location_name' })
    locationName: string;

    @CreateDateColumn()
    timestamp: Date;

    @ManyToOne(() => SigfoxDevice, device => device.locationHistory)
    device: SigfoxDevice;

    @ManyToOne(() => Location, { nullable: true })
    location: Location;
}
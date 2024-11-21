// src/entities/client.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Location } from './location.entity';
import { SigfoxDevice } from './sigfox-device.entity';

@Entity()
export class Client {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    address: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => User, user => user.client)
    users: User[];

    @OneToMany(() => Location, location => location.client)
    locations: Location[];

    @OneToMany(() => SigfoxDevice, device => device.client)
    devices: SigfoxDevice[];
}
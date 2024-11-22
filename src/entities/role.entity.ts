import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => User, user => user.role)
    users: User;
}
'use strict';

import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Phone } from 'src/phone/phone.entity';

@Entity({ name: 'licences' })
export class Licences {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id', type: 'int', nullable: true })
    user_id: number;

    @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
    name: string;

    @Column({ name: 'description', type: 'varchar', length: 200, nullable: true })
    description: string;

    @Column({ name: 'public_key', type: 'varchar', length: 70, nullable: true })
    public_key: string;

    @Column({ name: 'private_key', type: 'varchar', length: 70, nullable: true })
    private_key: string;

    @Column({ name: 'active', type: 'bit', nullable: false, default: true })
    active: boolean;

    @Column({ name: 'created_at', type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ name: 'updated_at', type: 'datetime', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

}
'use strict';

import { Contact } from 'src/contact/contact.entity';
import { Licences } from 'src/licences/licences.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, OneToMany, UpdateDateColumn, OneToOne } from 'typeorm';

@Entity()
export class Phone {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    phone_id: number;

    @Column({ unique: true })
    number: string;

    @Column({ name: 'status', type: 'varchar', nullable: true })
    status: string;
    
    @Column({ name: 'type', nullable: true })
    type: string;

    @Column({ nullable: true })
    name: string;

    @Column({ name: 'description', type: 'varchar', length: 200, nullable: true })
    description: string;

    @Column({ type: 'nvarchar', length: 'max' , nullable: true })
    data: Record<string, any>;
    
    @Column({ nullable: true })
    mult_device: boolean;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
  
    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    // Relationships
    // Phone has a many Contacts
    @OneToMany(() => Contact, contact => contact.phone)
    @JoinColumn()
    contacts: Contact[]

    @OneToOne(() => Licences, licence => licence.id)
    @JoinColumn()
    licences: Licences

}
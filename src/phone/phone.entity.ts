import { group } from 'console';
import { Contact } from 'src/contact/contact.entity';
import { Group } from 'src/group/group.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, OneToMany, UpdateDateColumn } from 'typeorm';

@Entity()
export class Phone {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({unique: true})
    phone_id: number;
    @Column({unique: true})
    number: string;
    @Column()
    status: string;
    @Column()
    type: string;
    @Column({nullable: true})
    name: string;
    @Column({ type: 'nvarchar', length: 'max' , nullable: true})
    data: Record<string, any>;
    @Column({nullable: true})
    mult_device: boolean;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    // Relationships
    // Phone has a many Contacts
    @OneToMany(() => Contact, contact => contact.phone)
    @JoinColumn()
    contacts: Contact[]
}
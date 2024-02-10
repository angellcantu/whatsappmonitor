import { group } from 'console';
import { Contact } from 'src/contact/contact.entity';
import { Group } from 'src/group/group.entity';
import { Entity, Column, PrimaryGeneratedColumn, Unique, JoinColumn, OneToMany } from 'typeorm';

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

    // @Column({ type: 'timestamp', default: () => 'GETDATE()' })
    // created_at: Date;

    // @Column({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
    // updated_at: Date;

    // Relationships
    // Phone has a many Contacts
    @OneToMany(() => Contact, contact => contact.phone)
    @JoinColumn()
    contacts: Contact[]
}
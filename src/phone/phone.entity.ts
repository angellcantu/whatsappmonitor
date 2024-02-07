import { group } from 'console';
import { Contact } from 'src/contact/contact.entity';
import { Group } from 'src/group/group.entity';
import { Entity, Column, PrimaryGeneratedColumn, Unique, JoinColumn, OneToMany } from 'typeorm';

@Entity({ name: 'phones' })
@Unique(['number', 'phone_id'])
export class Phone {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    phone_id: number;
    @Column()
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
// ESTO VA A LLAMAR AL API DE:
// https://api.maytapi.com/api/924cff3b-2265-4373-a78d-2f71036c9446/listPhones
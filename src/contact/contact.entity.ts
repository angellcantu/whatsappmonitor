import { Conversation } from 'src/conversation/conversation.entity';
import { Message } from 'src/message/message.entity';
import { Phone } from 'src/phone/phone.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToOne, JoinColumn, UpdateDateColumn, OneToOne, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    contact_id: string;

    @Column({ nullable: true })
    name: string;

    @Column({ type: 'nvarchar', length: 'max', nullable: true })
    image: string;

    @Column({ type: 'varchar', name: 'type' })
    type: string;

    @Column( { default: 0 } )
    group_number: number;

    // @Column({ type: 'timestamp', default: () => 'GETDATE()' })
    // created_at: Date;c

    // @Column({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
    // updated_at: Date;

    // Contact has a one Phone
    @ManyToOne(() => Phone, phone => phone.contacts)
    @JoinColumn()
    phone: Phone

    @ManyToMany(() => Conversation, conversation => conversation.contacts, { nullable: true })
    @JoinTable({
        name: 'conversation_contact',
        joinColumn: {
            name: 'contact_id',
        },
        inverseJoinColumn: {
            name: 'conversation_id',
        }
    })
    conversations: Conversation[]

    @OneToMany(() => Message, message => message.contact)
    messages: Message[]
}
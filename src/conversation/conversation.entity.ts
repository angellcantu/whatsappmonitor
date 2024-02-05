import { Contact } from 'src/contact/contact.entity';
import { Integrant } from 'src/integrant/integrant.entity';
import { Message } from 'src/message/message.entity';
import { Participant } from 'src/participant/participant.entity';
import { Phone } from 'src/phone/phone.entity';
import { User } from 'src/user/user.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, JoinTable, ManyToOne, JoinColumn, UpdateDateColumn, OneToOne, ManyToMany } from 'typeorm';

@Entity({ name: 'conversations' })
export class Conversation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    string_id: string;

    @Column({ nullable: false })
    name: string;

    @Column({ type: 'nvarchar', length: 'max' })
    config: Record<string, any>;
    
    // @Column({ type: 'timestamp', default: () => 'GETDATE()' })
    // created_at: Date;

    // @Column({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
    // updated_at: Date;

    @OneToMany(() => Message, message => message.conversation)
    messages: Message[];

    @ManyToMany(() => Contact, contact => contact.conversations)
    @JoinTable()
    contacts: Contact[]
}
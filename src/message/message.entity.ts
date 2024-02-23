import { join } from 'path';
import { Contact } from 'src/contact/contact.entity';
import { Conversation } from 'src/conversation/conversation.entity';
import { Integrant } from 'src/integrant/integrant.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, UpdateDateColumn } from 'typeorm';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    uuid: string;
    @Column()
    type: string;
    @Column({nullable: true})
    text: string;
    @Column({nullable: true})
    url: string;
    @Column({nullable: true})
    mime: string;
    @Column({nullable: true})
    filename: string;
    @Column({nullable: true})
    caption: string;
    @Column({nullable: true})
    payload: string;
    @Column({nullable: true})
    subtype: string;
    @Column({nullable: true})
    participant: string;
    @Column({nullable: true})
    _serialized: string;

    // @Column({ type: 'timestamp', default: () => 'GETDATE()' })
    // created_at: Date;

    // @Column({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
    // updated_at: Date;

    @ManyToOne(() => Conversation, conversation => conversation.messages)
    @JoinColumn()
    conversation: Conversation

    @ManyToOne(() => Contact, contact => contact.messages)
    @JoinColumn()
    contact: Contact
}
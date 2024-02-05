import { join } from 'path';
import { Conversation } from 'src/conversation/conversation.entity';
import { Group } from 'src/group/group.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToOne, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'messages' })
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    string_id: string;

    @Column()
    content: string;

    @Column()
    participant_id: number

    @Column()
    provider_id: string

    @Column()
    message_type: string

    @Column()
    url: string

    // @Column({ type: 'timestamp', default: () => 'GETDATE()' })
    // created_at: Date;

    // @Column({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
    // updated_at: Date;

    @ManyToOne(() => Conversation, conversation => conversation.messages)
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation
}
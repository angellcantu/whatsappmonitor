import { join } from 'path';
import { Group } from 'src/group/group.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToOne, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'messages' })
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

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

    // @CreateDateColumn({ type: 'timestamp', default: () => 'GETDATE()' })
    // created_at: Date;

    // @UpdateDateColumn({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
    // updated_at: Date;

    @ManyToOne(() => Group, group => group.messages)
    @JoinColumn({ name: 'group_id' })
    group: Group
}
import { Message } from 'src/message/message.entity';
import { Participant } from 'src/participant/participant.entity';
import { User } from 'src/user/user.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, JoinTable, ManyToOne, JoinColumn, UpdateDateColumn, OneToOne, ManyToMany } from 'typeorm';

@Entity({ name: 'groups' })
export class Group {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    // @CreateDateColumn({ type: 'timestamp', default: () => 'GETDATE()' })
    // created_at: Date;

    // @UpdateDateColumn({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
    // updated_at: Date;

    @ManyToOne(() => User, user => user.groups)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Message, message => message.group)
    messages: Message[];

    @ManyToMany(() => Participant, participant => participant.groups)
    @JoinTable()
    participants: Participant[]
}
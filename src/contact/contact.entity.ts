import { Conversation } from 'src/conversation/conversation.entity';
import { Integrant } from 'src/integrant/integrant.entity';
import { Message } from 'src/message/message.entity';
import { Participant } from 'src/participant/participant.entity';
import { Phone } from 'src/phone/phone.entity';
import { User } from 'src/user/user.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn, TableInheritance, JoinTable, ManyToOne, JoinColumn, UpdateDateColumn, OneToOne, ManyToMany } from 'typeorm';

@Entity({ name: 'contacts' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })

export class Contact {
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

    // Contact has a one Phone
    @ManyToOne(() => Phone, phone => phone.contacts)
    @JoinColumn()
    phone: Phone

    @ManyToMany(() => Conversation, conversation => conversation.contacts)
    @JoinTable()
    conversations: Conversation[]
}
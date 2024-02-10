import { Conversation } from 'src/conversation/conversation.entity';
import { Phone } from 'src/phone/phone.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToOne, JoinColumn, UpdateDateColumn, OneToOne, ManyToMany } from 'typeorm';

@Entity()
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    contact_id: string;

    @Column({ nullable: true })
    name: string;

    @Column({ type: 'nvarchar', length: 'max' , nullable: true})
    image: Record<string, any>;

    @Column({ type: 'varchar', name: 'type' })
    type: string;

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
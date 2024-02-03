import { Group } from 'src/group/group.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinColumn, OneToOne, JoinTable, Check } from 'typeorm';

@Entity({ name: 'participants' })
export class Participant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    phone_number: string

    @Column({ default: 'participant', enum: ['admin', 'participant']})
    role: string
    // @CreateDateColumn({ type: 'timestamp', default: () => 'GETDATE()' })
    // created_at: Date;

    // @UpdateDateColumn({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
    // updated_at: Date;

    @ManyToMany(() => Group, group => group.participants)
    @JoinTable()
    groups: Group[];
}
import { Contact } from 'src/contact/contact.entity';
import { Integrant } from 'src/integrant/integrant.entity';
import { Column, CreateDateColumn, UpdateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    id_group: string;
    @Column({ unique: true })
    name: string;
    @Column({ nullable: true })
    image: string;
    @Column({ type: 'nvarchar', length: 'max', nullable: true })
    config: Record<string, any>;

    @ManyToMany(() => Integrant, integrant => integrant.groups, { nullable: true })
    @JoinTable({
        name: 'group_integrant',
        joinColumn: {
            name: 'group_id',
        },
        inverseJoinColumn: {
            name: 'integrant_id',
        }
    })
    integrants: Integrant[]

    @Column({ nullable: true })
    id_municipio: number;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ default: true })
    status: boolean;

    @Column({nullable: true})
    last_message_date: string;
}
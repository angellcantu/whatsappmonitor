import { Entity, Column, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, JoinTable, ManyToOne, JoinColumn, UpdateDateColumn, OneToOne, ManyToMany } from 'typeorm';

@Entity()
export class Log {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    event: string;

    @Column()
    message: string;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
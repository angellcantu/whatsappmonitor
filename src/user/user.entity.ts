import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, UpdateDateColumn } from 'typeorm';
import { Group } from 'src/group/group.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    phone_number: string;

    // @Column({ type: 'timestamp', default: () => 'GETDATE()' })
    // created_at: Date;

    // @Column({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
    // updated_at: Date;
}
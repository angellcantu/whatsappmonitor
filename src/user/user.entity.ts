import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, UpdateDateColumn } from 'typeorm';
import { Group } from 'src/group/group.entity';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @Column({nullable: false})
    phone_number: string;

    // @CreateDateColumn({ type: 'timestamp', default: () => 'GETDATE()' })
    // created_at: Date;

    // @UpdateDateColumn({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
    // updated_at: Date;

    // Relacion uno a muchos de Users a Groups
    @OneToMany(() => Group, group => group.user)
    groups: Group[]
}
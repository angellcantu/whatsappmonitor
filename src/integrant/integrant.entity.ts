// objeto-base.entity.ts
import { Entity, CreateDateColumn,  UpdateDateColumn, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, JoinColumn, OneToMany } from 'typeorm';
import { Group } from 'src/group/group.entity';
import { Message } from 'src/message/message.entity';

@Entity()
export class Integrant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  id_integrant: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: false })
  phone_number: string

  @ManyToMany(() => Group, group => group.integrants, { nullable: true })
  @JoinTable({
    name: 'group_integrant',
    joinColumn: {
      name: 'integrant_id',
    },
    inverseJoinColumn: {
      name: 'group_id',
    }
  })
  groups: Group[];

  @Column({ nullable: false })
  type: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
  
  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
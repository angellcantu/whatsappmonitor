// objeto-base.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, JoinColumn, OneToMany } from 'typeorm';
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

  @Column({ nullable: false, unique: true })
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
  // @Column({ type: 'timestamp', default: () => 'GETDATE()' })
  // created_at: Date;

  // @Column({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
  // updated_at: Date;

  // @OneToMany(() => Message, message => message.integrant, { nullable: true })
  // @JoinColumn()
  // messages: Message[]
}
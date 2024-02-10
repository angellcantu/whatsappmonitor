// objeto-base.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, JoinColumn, OneToMany } from 'typeorm';
import { Group } from 'src/group/group.entity';
import { Message } from 'src/message/message.entity';

@Entity()
export class Integrant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  integrant_id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: false, unique: true })
  phone_number: string

  @ManyToMany(() => Group, group => group.integrants, { nullable: true })
  @JoinTable({
    name: 'group_integrant',
    joinColumn: {
      name: 'integrant_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'group_id',
      referencedColumnName: 'id'
    }
  })
  groups: Group[];

  // @OneToMany(() => Group, group => group.integrants)
  // @JoinColumn({name: 'id_group'})
  // groups: Group[];

  // @Column({nullable: true})
  // id_group: number

  @Column({ nullable: false })
  type: string;
  // @Column({ type: 'timestamp', default: () => 'GETDATE()' })
  // created_at: Date;

  // @Column({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
  // updated_at: Date;

  @OneToMany(() => Message, message => message.integrant, { nullable: true })
  @JoinColumn({ name: 'integrant_id' })
  messages: Message[]
}
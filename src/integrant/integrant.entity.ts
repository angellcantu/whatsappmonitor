// objeto-base.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Group } from 'src/group/group.entity';

@Entity('integrants')
export class Integrant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false})
  contact_id: number;

  @Column({nullable: false})
  name: string;
  @Column({nullable: false, unique: true})
  phone_number: string

  @ManyToMany(() => Group, group => group.participants)
  @JoinTable()
  groups: Group[];

  @Column()
  active: boolean;

  @Column({nullable: false, default: 'participant', enum: ['admin', 'participant']})
  type: string;
}
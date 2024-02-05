// objeto-base.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, TableInheritance } from 'typeorm';
import { Group } from 'src/group/group.entity';

@Entity('integrants')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class Integrant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contact_id: number;

  @Column({nullable: false})
  name: string;
  @Column({nullable: false, unique: true})
  phone_number: string

  @ManyToMany(() => Group, group => group.integrants)
  @JoinTable()
  groups: Group[];

  @Column()
  active: boolean;

  // @Column({ type: 'timestamp', default: () => 'GETDATE()' })
  // created_at: Date;

  // @Column({ type: 'timestamp', default: () => 'GETDATE()', onUpdate: 'GETDATE()' })
  // updated_at: Date;
}
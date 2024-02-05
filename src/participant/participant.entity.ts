import { Group } from 'src/group/group.entity';
import { Integrant } from 'src/integrant/integrant.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinColumn, OneToOne, JoinTable, Check } from 'typeorm';

@Entity({ name: 'participants' })
export class Participant extends Integrant { }
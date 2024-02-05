import { Contact } from 'src/contact/contact.entity';
import { Integrant } from 'src/integrant/integrant.entity';
import { Message } from 'src/message/message.entity';
import { Participant } from 'src/participant/participant.entity';
import { Phone } from 'src/phone/phone.entity';
import { User } from 'src/user/user.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, JoinTable, ManyToOne, JoinColumn, UpdateDateColumn, OneToOne, ManyToMany } from 'typeorm';

@Entity({ name: 'groups' })
export class Group extends Contact{
    @ManyToMany(() => Integrant, integrant => integrant.groups)
    @JoinTable()
    integrants: Integrant[]
}
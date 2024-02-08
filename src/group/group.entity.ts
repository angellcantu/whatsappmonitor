import { Contact } from 'src/contact/contact.entity';
import { Integrant } from 'src/integrant/integrant.entity';
import { Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity({name: 'contacts'})
export class Group extends Contact{
    @ManyToMany(() => Integrant, integrant => integrant.groups)
    @JoinTable()
    integrants: Integrant[]
}
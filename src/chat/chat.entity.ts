import { Contact } from 'src/contact/contact.entity';
import { Entity } from 'typeorm';

@Entity({name: 'contacts'})
export class Chat extends Contact { }
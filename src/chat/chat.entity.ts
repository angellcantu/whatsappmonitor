import { Contact } from 'src/contact/contact.entity';
import { Entity } from 'typeorm';

@Entity({ name: 'chats' })
export class Chat extends Contact {

}
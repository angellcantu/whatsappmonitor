import { Contact } from "src/contact/contact.entity";

export interface IMessage {
  uuid: string;
  type:
    | string
    | 'text'
    | 'document'
    | 'image'
    | 'audio'
    | 'location'
    | 'vcard'
    | 'poll'
    | 'info'
    | 'sticker'
    | 'ptt';
  text?: string;
  url?: string;
  mime?: string;
  filename?: string;
  caption?: string;
  payload?: string;
  subtype?: string;
  participant?: string;
  _serialized: string;
  contact: Contact;
}
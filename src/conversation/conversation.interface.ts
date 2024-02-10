import { Contact } from "src/contact/contact.entity";
import { Message } from "src/message/message.entity";

export interface IConversation{ 
    id_conversation: string;
    messages?: Message[];
    contacts?: Contact[];
}
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Contact } from './contact.entity'
import { IContact } from "./contact.interface";
import { Group } from "src/group/group.entity";
import { GroupService } from "src/group/group.service";
import { Phone } from "src/phone/phone.entity";
import { Conversation } from "src/conversation/conversation.entity";
import { Message } from "src/message/message.entity";

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>,
    ) { }

    async findAll(): Promise<Contact[]> {
        try {
            return await this.contactRepository.find({where: {type: "chat"}});
        } catch(error) {
            console.log(error);
        }
    }

    async findOne(contact_id: string): Promise<Contact | undefined> {
        try {
            return await this.contactRepository.findOne({ where: { contact_id } });
        } catch (error) {
            console.log(error);
        }
    }

    async createContact(_contact: IContact): Promise<Contact | undefined> {
        try {
            const contact: IContact = {
                contact_id: _contact.contact_id,
                name: _contact.name,
                type: _contact.type,
                image: null,
                phone: _contact.phone
            }

            return await this.contactRepository.save(contact);
        } catch (error) {
            console.log(error)
        }
    }

    async saveConversationInContact(contact: Contact) {
        try {
            await this.contactRepository.save(contact);
        } catch (error) {
            console.log(error);
        }
    }

    async existsContact(contact_id: string): Promise<boolean>{
        try {
            const contact = await this.contactRepository.findOne({ where: { contact_id: contact_id } });
            console.log(contact)
            return contact ? true : false;
        } catch (error) {
            console.log("no existe el contacto")
        }
    }

    async createContacts(_contacts: IContact[]): Promise<void> {
        try {
            for (const contact of _contacts) {
                if (await this.findOne(contact.contact_id)) { continue; }
                await this.createContact(contact)
            }
        } catch (error) {
            console.log("Erro al crear contacto")
        }
    }

    async isGroup?(contact_id: string): Promise<boolean> {
        const contact: Contact = await this.contactRepository.findOne({ where: { contact_id } })
        return contact.type === "group" ? true : false
    }

    async isChat?(contact_id: string): Promise<boolean> {
        const contact: Contact = await this.contactRepository.findOne({ where: { contact_id } })
        return contact.type === "chat" ? true : false
    }

    async getGroupsId(): Promise<string[]> {
        const groupsContact: Contact[] = await this.contactRepository.find({ where: { type: "group" } });
        const groupsName: string[] = await groupsContact.map(contact => contact.contact_id);
        return groupsName;
    }

    async loadImage(contact_id: string, image: string): Promise<void> {
        try {
            const contact: Contact = await this.findOne(contact_id);
            contact.image = image;
            await this.contactRepository.update(contact.id, { image });
        } catch (error) {
            console.log(error);
        }
    }
}
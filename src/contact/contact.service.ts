import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Contact } from './contact.entity'
import { IContact } from "./contact.interface";

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>,
    ) { }

    async findAll(): Promise<Contact[]> {
        try {
            const rawQuery = `
                SELECT c.id, c.contact_id, c.name, c.image, c.type, c.phoneId, COUNT(DISTINCT gi.group_id) AS groups
                FROM  contact c
                LEFT JOIN integrant i ON i.id_integrant = c.contact_id
                LEFT JOIN group_integrant gi ON gi.integrant_id = i.id
                WHERE c.type = 'chat'
                GROUP BY c.id, c.name, c.image, c.type, c.phoneId
            `;
            const results = await this.contactRepository.query(rawQuery);
            return results.map(result => {
                const contact = new Contact();
                contact.id = result.id,
                contact.contact_id = result.contact_id,
                contact.name = result.name,
                contact.image = result.image,
                contact.type = result.type,
                contact.phone = result.phoneId
                contact.group_number = result.groups
                return contact;
            });
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
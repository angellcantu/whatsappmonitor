import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Contact } from './contact.entity'
import { IContact } from "./contact.interface";
import { Chat } from "src/chat/chat.entity";
import { Group } from "src/group/group.entity";
import { ChatService } from "src/chat/chat.service";
import { GroupService } from "src/group/group.service";
import { IChat } from "src/chat/chat.interface";
import { IGroup } from "src/group/group.interface";
import { Phone } from "src/phone/phone.entity";

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>,
        @InjectRepository(Chat)
        private chatRepository: Repository<Chat>,
        @InjectRepository(Group)
        private groupRepository: Repository<Group>,
        private chatService: ChatService,
        private groupService: GroupService
    ) { }

    async findAll(): Promise<Contact[]> {
        return this.contactRepository.find();
    }

    async findOne(contact_id: string): Promise<Contact | undefined> {
        return this.contactRepository.findOne({ where: { contact_id } })
    }

    async createContact(_contact: IContact): Promise<void> {
        try {
            if (_contact.type === 'chat') {
                const chat: IChat = {
                    contact_id: _contact.contact_id,
                    name: _contact.name,
                    type: 'chat',
                    image: JSON.stringify([]),
                    phone: _contact.phone
                }
                await this.chatService.createChat(chat);
            } else {
                const group: IGroup = {
                    contact_id: _contact.contact_id,
                    name: _contact.name,
                    type: 'group',
                    image: JSON.stringify([]),
                    phone: _contact.phone
                }
                await this.chatService.createChat(group);
            }
        } catch (error) {
            console.log(error)
        }
    }

    async createContacts(contacts: any[], phone: Phone): Promise<void> {
        for (const contact of contacts) {
            const contactInterface: IContact = {
                contact_id: contact.id,
                name: contact.name,
                type: contact.type,
                image: JSON.stringify(contact.image),
                phone: phone
            }

            await this.createContact(contactInterface);
        }
    }

    async loadImage(contact_id: string, image: any[]): Promise<void> {
        try {
            const contact: Contact = await this.findOne(contact_id);
            contact.image['url'] = image;

            // await this.chatRepository.save(contact);
        } catch (error) {
            console.log(error);
        }
    }
}
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Phone } from "src/phone/phone.entity";
import { Conversation } from "./conversation.entity";
import { IConversation } from "./conversation.interface";

@Injectable()
export class ConversationService {
    constructor(
        @InjectRepository(Conversation)
        private conversationRepository: Repository<Conversation>,
    ) { }

    async findAll(): Promise<Conversation[]> {
        return await this.conversationRepository.find();
    }

    async findOne(conversation_id: string): Promise<Conversation | undefined> {
        return await this.conversationRepository.findOne({ where: { id_conversation: conversation_id } })
    }

    async createConversation(_conversation: IConversation): Promise<Conversation | undefined> {
        try {
            const conversation: Conversation = await this.conversationRepository.create({
                id_conversation: _conversation.id_conversation,
                contacts: _conversation.contacts,
                messages: _conversation.messages
            })
            return await this.conversationRepository.save(conversation);
        } catch (error) {
            console.log(error)
        }
    }

    async findOrCreate(_conversation: IConversation): Promise<Conversation | undefined> {
        try {
            const conversation: Conversation = await this.findOne(_conversation.id_conversation);
            if (!conversation) {
                return await this.conversationRepository.create({
                    id_conversation: _conversation.id_conversation,
                    contacts: _conversation.contacts,
                    messages: _conversation.messages
                });
            }

            return conversation;
        } catch (error) {
            console.log(error);
        }
    }

    async existsConversation(conversation_id: string): Promise<boolean> {
        try {
            const conversation = await this.findOne(conversation_id);
            return conversation ? true : false;
        } catch (error) {
            console.log("No existe conversacion")
        }
    }

    async createConversations(contacts: any[], phone: Phone): Promise<void> {
        for (const contact of contacts) {
            // const contactInterface: IContact = {
            //     contact_id: contact.id,
            //     name: contact.name,
            //     type: contact.type,
            //     image: null,
            //     phone: phone
            // }

            // await this.createContact(contactInterface);
        }
    }
}
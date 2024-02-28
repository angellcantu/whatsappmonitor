import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from './message.entity'
import { IMessage } from "./message.interface"; import { Integrant } from "src/integrant/integrant.entity";
import { IntegrantService } from "src/integrant/integrant.service";
import { Contact } from "src/contact/contact.entity";
import { Conversation } from "src/conversation/conversation.entity";

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        private readonly integrantService: IntegrantService
    ) { }

    async findAll(): Promise<Message[]> {
        return this.messageRepository.find();
    }

    async createMessages(messages: any[]): Promise<void> {
        for (const message of messages) {
            // const message: Message = {
            //     message_id: 
            // }
        }
    }

    async createMessage(_message: IMessage | undefined) {
        try {
            const tempMessage: Message = await this.messageRepository.findOne({ where: { _serialized: _message._serialized } });
            if (tempMessage) {
                return tempMessage;
            }

            const message: Message = await this.messageRepository.create({
                uuid: _message.uuid,
                type: _message.type,
                text: _message.text,
                url: _message.url,
                mime: _message.mime,
                filename: _message.filename,
                caption: _message.caption,
                payload: _message.payload,
                subtype: _message.subtype,
                participant: _message.participant,
                _serialized: _message._serialized,
                contact: _message.contact
            });

            return await this.messageRepository.save(message);
        } catch (error) {
            console.log(error);
        }
    }

    async getMessageByGroup(id_group: string): Promise<Message[]> {
        try {
            const groupMessage: Message[] = await this.messageRepository.find({
                relations: ['contact'],
                where: { conversation: { id_conversation: id_group } }
            });

            return groupMessage;
        } catch (error) {
            console.log(error);
        }
    }

    private async typeMessageInfo(_message: any | undefined) {
        const integrant: Integrant = await this.integrantService.findOne(_message.uuid)
        // const message: Message = {
        //     uuid: _message.uuid,
        //     type: _message.message.type,
        //     _serialized: _message.message._serialized,
        //     text: await this.hasPropiety('text', _message.message),
        //     url: await this.hasPropiety('url', _message.message),
        //     mime: await this.hasPropiety('mime', _message.message),
        //     filename: await this.hasPropiety('filename', _message.message),
        //     caption: await this.hasPropiety('caption', _message.message),
        //     payload: await this.hasPropiety('payload', _message.message),
        //     subtype: await this.hasPropiety('subtype', _message.message),
        //     participant: await this.hasPropiety('participant', _message.message),
        //     integrant: integrant
        // }
    }

    async saveContactInMessage(message: Message, contact: Contact, conversation: Conversation): Promise<Message | undefined> {
        try {

            await this.messageRepository.update(message.id, { contact, conversation });
            return
        } catch (error) {
            console.log(error);
        }
    }
}
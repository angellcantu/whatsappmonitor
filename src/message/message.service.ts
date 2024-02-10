import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from './message.entity'
import { IMessage } from "./message.interface";import { Integrant } from "src/integrant/integrant.entity";
import { IntegrantService } from "src/integrant/integrant.service";

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

    private hasPropiety(propiety: string, message: any): Promise<string | undefined> {
        return message.hasOwnProperty(propiety) ? message[propiety] : undefined
    }
}
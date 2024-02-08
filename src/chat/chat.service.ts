import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chat } from "src/chat/chat.entity";
import { IChat } from "./chat.interface";

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Chat)
        private chatRepository: Repository<Chat>
    ) { }

    async createChat(chat: IChat): Promise<void> {
        try {
            await this.chatRepository.save(chat)
            // return { success: true, message: 'Chat creado exitosamente' };
        } catch (error) {
            // return { success: false, message: 'Error interno al crear el chat' };
            console.log(error);
        }
    }

    async findOneChat(chat_id: number): Promise<Chat | undefined> {
        try {
            const chat: Chat = await this.chatRepository.findOne({ where: { id: chat_id } })
            if (!chat) {
                throw new NotFoundException('Chat no encontrado');
                return;
            }
            return chat;
        } catch (error) {
            console.log("Error interno al buscar el chat")
        }
    }

    async loadImagesInChat(): Promise<void> {

    }
}
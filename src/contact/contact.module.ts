import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { Contact } from './contact.entity';
import { Chat } from 'src/chat/chat.entity';
import { Group } from 'src/group/group.entity';
import { ChatService } from 'src/chat/chat.service';
import { GroupService } from 'src/group/group.service';

@Module({
    imports: [TypeOrmModule.forFeature([Contact, Chat, Group])],
    providers: [ContactService, ChatService, GroupService],
    exports: [ContactService, ChatService, GroupService]
})

export class ContactModule { }
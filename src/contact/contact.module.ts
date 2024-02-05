import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { Contact } from './contact.entity';
import { Chat } from 'src/chat/chat.entity';
import { Group } from 'src/group/group.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Contact, Chat, Group])],
    controllers: [],
    providers: [ContactService]
})

export class ContactModule { }
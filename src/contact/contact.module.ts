import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { Contact } from './contact.entity';
import { Group } from 'src/group/group.entity';
import { GroupService } from 'src/group/group.service';

@Module({
    imports: [TypeOrmModule.forFeature([Contact])],
    providers: [ContactService],
    exports: [ContactService]
})

export class ContactModule { }
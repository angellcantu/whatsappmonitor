import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { Contact } from './contact.entity';
import { Group } from 'src/group/group.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Contact])],
    providers: [ContactService],
    exports: [ContactService]
})

export class ContactModule { }
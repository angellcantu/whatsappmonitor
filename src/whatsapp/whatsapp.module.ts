import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappService } from './whatsapp.service';
import { PhoneService } from 'src/phone/phone.service';

@Module({
    imports: [PhoneService],
    controllers: [],
    providers: [WhatsappService, PhoneService]
})

export class WhatsappModule {}
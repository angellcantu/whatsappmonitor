import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappService } from './whatsapp.service';

@Module({
    imports: [],
    controllers: [],
    providers: [WhatsappService]
})

export class WhatsappModule {}
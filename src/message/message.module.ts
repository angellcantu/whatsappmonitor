import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { Message } from './message.entity';
import { IntegrantService } from 'src/integrant/integrant.service';


@Module({
    imports: [TypeOrmModule.forFeature([Message])],
    controllers: [],
    providers: [MessageService, IntegrantService],
    exports: [MessageService]
})

export class MessageModule {}
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { PhoneModule } from './phone/phone.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './contact/contact.entity';
import { Chat } from './chat/chat.entity';
import { ContactModule } from './contact/contact.module';
import { Group } from './group/group.entity';

@Module({
  imports: [
    DatabaseModule,
    PhoneModule,
    ContactModule,
    TypeOrmModule.forFeature(
      [Contact, Chat, Group]
    )
  ],
  controllers: [AppController, WebhookController],
  providers: [
    AppService,
    WebhookService,
    WhatsappService,
  ],
})
export class AppModule { }

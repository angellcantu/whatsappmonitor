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
import { ContactModule } from './contact/contact.module';
import { Group } from './group/group.entity';
import { Integrant } from './integrant/integrant.entity';
import { IntegrantService } from './integrant/integrant.service';
import { GroupService } from './group/group.service';
import { MessageService } from './message/message.service';
import { Message } from './message/message.entity';
import { ConversationService } from './conversation/conversation.service';
import { Conversation } from './conversation/conversation.entity';
import { GroupController } from './group/group.controller';
import { GroupQueries } from './group/group.queries';
import { IntegrantQueries } from './integrant/integrant.queries';

@Module({
  imports: [
    DatabaseModule,
    PhoneModule,
    ContactModule,
    TypeOrmModule.forFeature(
      [Contact, Group, Integrant, Message, Conversation]
    )
  ],
  controllers: [AppController, WebhookController,  GroupController],
  providers: [
    AppService,
    WebhookService,
    WhatsappService,
    IntegrantService,
    GroupService,
    MessageService,
    ConversationService,
    IntegrantQueries,
    GroupQueries
  ],
})
export class AppModule { }

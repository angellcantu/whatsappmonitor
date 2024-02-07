import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { PhoneModule } from './phone/phone.module';

@Module({
  imports: [DatabaseModule, PhoneModule],
  controllers: [AppController, WebhookController],
  providers: [AppService, WebhookService, WhatsappService],
})
export class AppModule {}

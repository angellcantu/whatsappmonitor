import { Controller, Get, Post, Body } from "@nestjs/common";
import { WebhookService } from "./webhook.service";
import { WhatsappService } from "src/whatsapp/whatsapp.service";

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly webhookService: WebhookService,
        private readonly whatsappService: WhatsappService
    ) { }

    @Post()
    posthanldeWebhook(@Body() payload: any) {
        console.log('Payload recibido: ', payload)
        // AQUI VAMOS A RECIBIR TODAS LAS PETICIONES DEL WEBHOOK
        return { message: 'Se recibio el webhook' }
    }

    @Get()
    async hanldeWebhook() {
        // await this.whatsappService.loadPhoneList();
        // await this.whatsappService.loadContacts();
        // await this.whatsappService.loadGroupsIntegrants();
        await this.whatsappService.loadGroupConversations();

    
        // await this.whatsappService.loadGroupConversations();

        return {  }
    }
}
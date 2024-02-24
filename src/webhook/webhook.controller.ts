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
    async posthanldeWebhook(@Body() payload: any) {
        console.log('Payload recibido: ', payload)
        // AQUI VAMOS A RECIBIR TODAS LAS PETICIONES DEL WEBHOOK
        await this.whatsappService.webhookValidation(payload);
        return { message: 'Se recibio el webhook' }
    }

    @Get()
    async hanldeWebhook() {
        // Validar que el telefono sea unico FindOrCreate
        await this.whatsappService.loadPhoneList();
        await this.whatsappService.loadContacts();
        await this.whatsappService.loadImagesInContacts();
        await this.whatsappService.loadGroupsIntegrants();

        await this.whatsappService.loadGroupConversations();

        return {  }
    }
}
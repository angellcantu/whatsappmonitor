import { Controller, Get } from "@nestjs/common";
import { WebhookService } from "./webhook.service";
// import { Webhook } from "./webhook.entity";

@Controller('webhook')
export class UserController {
    constructor(private readonly webhookService: WebhookService) { }

    @Get()
    hanldeWebhook(): Promise<void> {
        // AQUI VAMOS A RECIBIR TODAS LAS PETICIONES DEL WEBHOOK
        return;
    }
}
// https://www.youtube.com/watch?v=geGcMSCtDVk
// https://www.youtube.com/watch?v=-ahCssisfwQ
// https://www.youtube.com/watch?v=iXfVzLEEZXU
// https://www.youtube.com/watch?v=JsgdvPMMdGA
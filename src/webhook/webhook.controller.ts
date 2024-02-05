import { Controller, Get, Post, Body } from "@nestjs/common";
import { WebhookService } from "./webhook.service";
// import { Webhook } from "./webhook.entity";

@Controller('webhook')
export class WebhookController {
    constructor(private readonly webhookService: WebhookService) { }

    // @Get()
    // hanldeWebhook(@Body() payload: any) {
    //     console.log('Payload recibido: ', payload)
    //     // AQUI VAMOS A RECIBIR TODAS LAS PETICIONES DEL WEBHOOK
    //     return {message: 'Se recibio el webhook'}
    // }

    @Get()
    hanldeWebhook() {
        // console.log('Payload recibido: ', ==)
        // AQUI VAMOS A RECIBIR TODAS LAS PETICIONES DEL WEBHOOK
        return {message: 'Se recibio el webhook'}
    }
}
// https://www.youtube.com/watch?v=geGcMSCtDVk
// https://www.youtube.com/watch?v=-ahCssisfwQ
// https://www.youtube.com/watch?v=iXfVzLEEZXU
// https://www.youtube.com/watch?v=JsgdvPMMdGA
// https://www.youtube.com/watch?v=bZlP1C9q14E
import { Controller, Get } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { WebhookService } from "src/webhook/webhook.service";

@Controller('webhook')
export class WebhookController {
    constructor(private readonly webhookService: WebhookService) { }

    @Get()
    hanldeWebhook(): Promise<void> {
        return;
    }
}
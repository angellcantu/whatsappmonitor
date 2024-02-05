import { Controller, Get } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";

@Controller('webhook')
export class UserController {
    constructor(private readonly webhookService: UserService) { }

    @Get()
    hanldeWebhook(): Promise<void> {
        return;
    }
}
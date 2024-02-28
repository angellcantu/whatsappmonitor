import { Inject, Injectable, Logger } from "@nestjs/common";
import * as cron from 'node-cron';
import { WhatsappService } from "src/whatsapp/whatsapp.service";

@Injectable()

export class UpdateGroupInfoService {
    private readonly logger = new Logger(UpdateGroupInfoService.name);
    private readonly _whatsappService: WhatsappService;

    constructor() {
        cron.schedule("59 23 * * *", () => {
            this.logger.debug('Tarea programada ejecutada a las 11:59 PM');
            this.loadGroupInfo();
        });
    }

    private async loadGroupInfo(): Promise<void> {
        await this._whatsappService.loadGroupsIntegrants();
        await this._whatsappService.loadGroupConversations();
    }
} 
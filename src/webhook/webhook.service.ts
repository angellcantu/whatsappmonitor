import * as rp from 'request-promise-native';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class WebhookService {
    constructor() {
        // this.assignWebhook();
    }
    private async assignWebhook(): Promise<void> {
        try {
            const url_webehook = {
                webhook: "https://whatsappmonitor.onrender.com/webhook"
            }

            const url = `${process.env.INSTANCE_URL}/${process.env.PRODUCT_ID}/setWebhook`;
            console.log(url);
            const response = await rp(url, {
                method: 'post',
                json: true,
                body: url_webehook,
            });

            if (response.statusCode == 200) {
                return response.body
            } else {
                throw new Error(`Solicitud fallida status: ${response.statusCode}`);
            }

        } catch (error) {
            throw new Error(error);
        }
    }

    
}
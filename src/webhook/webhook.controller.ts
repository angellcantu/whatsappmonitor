'use strict';

import { Controller, Get, Post, Body } from "@nestjs/common";
import { WebhookService } from "./webhook.service";
import { WhatsappService } from "src/whatsapp/whatsapp.service";
import { Connection } from 'typeorm';

@Controller('webhook')
export class WebhookController {

    constructor(
        private readonly webhookService: WebhookService,
        private readonly whatsappService: WhatsappService,
        private readonly connection: Connection
    ) { }

    @Post()
    async posthanldeWebhook(@Body() payload: any) {
        console.log('Payload recibido: ', payload)
        // AQUI VAMOS A RECIBIR TODAS LAS PETICIONES DEL WEBHOOK
        console.log(`${process.env.INSTANCE_URL}/${process.env.PRODUCT_ID}`);
        await this.whatsappService.webhookValidation(payload);
        
        return { message: 'Se recibio el webhook' }
    }

    @Get()
    async hanldeWebhook() {
        await this.whatsappService.loadPhoneList();
        await this.whatsappService.loadContacts();
        await this.whatsappService.loadImagesInContacts();
        await this.whatsappService.loadImagesInGroups();
        await this.whatsappService.loadGroupsIntegrants();
        await this.whatsappService.loadGroupConversations();

        return { status: 'Cargando datos en segundo plano' };
    }

    @Post('/test')
    async storedProcedure(@Body() body: any) {
        let { message, user } = body;

        // save the request
        let [request] = await this.connection.query('EXEC forms.SaveRequests @0;', [user.id]);
        
        // create the internal session
        let [session] = await this.connection.query('EXEC forms.CreateSessionRequest @0;', [request.id]);
        let { form_id } = session;

        if (!form_id && !String(message.text).match(new RegExp('/'))) {
            console.log('Invalid command');
            let [_default] = await this.connection.query('EXEC forms.ValidateCommand @0, @1;', ['', 2]);
            console.log(`${_default.message}${_default.name}`);
        } else if (!form_id && String(message.text).match(new RegExp('/'))) {
            console.log('Valid command and starting the new form');
            let [command] = await this.connection.query('EXEC forms.ValidateCommand @0;', [message.text]);

            if (command) {
                // get the form identifier by command identifier
                let [form] = await this.connection.query('EXEC forms.GetFormIdentifierByCommandIdentifier @0;', [command.id]);
                let { id } = form;

                // updating the form in the session request
                let [formSessionRequest] = await this.connection.query('EXEC forms.UpdateFormToSessionRequest @0, @1;', [request.id, id]);

                if (formSessionRequest) {
                    // we need to send the first message
                    let [question] = await this.connection.query('EXEC forms.SaveAnswerAndRetrieveNextQuestion @0, @1, @2;', [request.id, session.id, '']);

                    console.log('Sending the first question');
                    console.log(question);
                }
            } else {
                body.message.text = 'Hi';
                return this.storedProcedure(body);
            }
        } else {
            console.log('Continue with the other process and sending the next question');

            let questions = await this.connection.query('EXEC forms.SaveAnswerAndRetrieveNextQuestion @0, @1, @2;', [request.id, session.id, String(message.text)]);
            
            if (questions && questions.length) {
                let [question] = questions;
                console.log(question);
            } else {
                // close the internal session
                let [session] = await this.connection.query('EXEC forms.ClosedSessionRequest @0;', [request.id]);
                
                if (session) {
                    let [defaultCommand] = await this.connection.query('EXEC forms.ValidateCommand @0, @1;', ['', 1]);
                    console.log(defaultCommand);
                }
            }
        }

        return { success: true };
    }

}
'use strict';

import { Controller, Get, Post, Body } from "@nestjs/common";
import { WhatsappService } from "src/whatsapp/whatsapp.service";
import { Connection } from 'typeorm';

@Controller('webhook')
export class WebhookController {

    constructor(
        private readonly whatsappService: WhatsappService,
        private readonly connection: Connection
    ) { }

    @Post()
    async handleWebhook(@Body() payload: any) {
        this.whatsappService.webhookValidation(payload);
        return {
            success: true
        };
    }

    @Get()
    loadBackground() {
        new Promise(async (resolve) => {
            await this.whatsappService.loadPhoneList();
            await this.whatsappService.loadContacts();
            await this.whatsappService.loadImagesInContacts();
            await this.whatsappService.loadImagesInGroups();
            await this.whatsappService.loadGroupsIntegrants();
            await this.whatsappService.loadGroupConversations();
            resolve(true);
        })
        .then(result => result)
        .catch(error => { throw error; });
        return {
            success: true
        };
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
            let answer: string = '';

            if (message.type == 'location') {
                answer = message.payload;
            } else if (message.type == 'text') {
                answer = message.text;
            }

            let questions = await this.connection.query('EXEC forms.SaveAnswerAndRetrieveNextQuestion @0, @1, @2;', [request.id, session.id, answer]);
            
            if (questions && questions.length) {
                let [question] = questions;
                console.log(question);
            } else {
                // validate if the form has command response - this only apply if the forma has a single question
                let responses = await this.connection.query('forms.ValidateFormResponses @0;', [request.id]);

                if (responses && responses.length) {
                    let [response] = responses;
                    let answers = await this.connection.query('forms.RetrieveFormResponse @0, @1, @2;', [response.name, request.id, session.id]);

                    if (answers && answers.length) {
                        let [answer] = answers;
                        console.log(answer.name);
                        console.log(answer.latitude, answer.longitude);
                    }
                }

                // close the internal session
                let [_session] = await this.connection.query('EXEC forms.ClosedSessionRequest @0;', [request.id]);
                
                if (_session) {
                    let [defaultCommand] = await this.connection.query('EXEC forms.ValidateCommand @0, @1;', ['', 1]);
                    console.log(defaultCommand);
                }
            }
        }

        return { success: true };
    }

}
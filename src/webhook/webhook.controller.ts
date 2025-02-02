'use strict';

import { Controller, Get, Post, Body, UseInterceptors, HttpException, HttpStatus, UploadedFile } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExcludeController } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { WhatsappService } from "src/whatsapp/whatsapp.service";
import { Connection } from 'typeorm';
import { IWebhook, IDataOptions } from '../whatsapp/whatsapp.interface';

@Controller('webhook')
@ApiTags('Webhooks')
@ApiExcludeController()
export class WebhookController {

    constructor(
        private readonly whatsappService: WhatsappService,
        private readonly connection: Connection
    ) { }

    @Post()
    @ApiOperation({ deprecated: true })
    async handleWebhook(@Body() payload: any) {
        this.whatsappService.webhookValidation(payload);
        return {
            success: true
        };
    }

    @Post('/uat')
    @ApiOperation({ deprecated: true })
    uatBot(@Body() body: any) {
        this.whatsappService.uatBot(body);
        return { success: true };
    }

    @Get()
    @ApiOperation({ deprecated: true })
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
    @ApiOperation({ deprecated: true })
    async storedProcedure(@Body() body: IWebhook) {
        let { message, user, type, data } = body,
            userId: string = '';

        if (['ack'].includes(type) && !message) {
            body['message'] = {
                fromMe: false,
                type: 'poll'
            };
            return this.storedProcedure(body);
        } else if (['ack'].includes(type) && message) {
            let [item] = data;
            userId = item?.chatId;
        }  else if (['message'].includes(type)) {
            userId = user?.id;
        }

        if (message && !message?.fromMe) {
            // save the request https://whatsappmonitor-u61l.onrender.com/webhook
            let [request] = await this.connection.query('EXEC forms.SaveRequests @0;', [userId]);
            
            // create the internal session
            let [session] = await this.connection.query('EXEC forms.CreateSessionRequest @0;', [request.id]);
            let { form_id } = session;

            if (!form_id && (message && String(message.text).trim().toLowerCase().match(new RegExp('/menu')))) {
                console.log('Invalid command');
                let [_default] = await this.connection.query('EXEC forms.ValidateCommand @0, @1, @2;', ['', 2, request.id]);
                
                if (_default.name) {
                    console.log(`${_default.message}${_default.name}`);
                } else {
                    let [_default] = await this.connection.query('EXEC forms.ValidateCommand @0, @1;', ['', 3]);
                    console.log(`${_default.message}${_default.name}`);
                }
            } else if (!form_id && (message && /[\d/]+/g.test(String(message.text).trim()))) {
                console.log('Valid command and starting the new form');
                let [_, text] = String(message.text).trim().split('/');
                console.log(String(message.text).trim().split('/'));
                let [command] = await this.connection.query('EXEC forms.ValidateCommand @0;', [`/${text}`]);

                if (command) {
                    // get the form identifier by command identifier
                    let [form] = await this.connection.query('EXEC forms.GetFormIdentifierByCommandIdentifier @0;', [command.id]);
                    let { id } = form;

                    // here we validate if the user already fill the form
                    let validations = await this.connection.query('EXEC forms.ValidateIfFormIsFilled @0, @1;', [request.id, id]);
                    console.log(validations);

                    // updating the form in the session request
                    let [formSessionRequest] = await this.connection.query('EXEC forms.UpdateFormToSessionRequest @0, @1;', [request.id, id]);

                    if (formSessionRequest) {
                        // we need to send the first message
                        let [question] = await this.connection.query('EXEC forms.SaveAnswerAndRetrieveNextQuestion @0, @1, @2;', [request.id, session.id, '']);

                        console.log('Sending the first question');
                        console.log(question.name);
                        if (question.question_options) {
                            question.question_options = String(question.question_options).split(',');
                        }
                    }

                    /*if (validations.length) {
                        let [validation] = validations;

                        if (validation.is_filled > 0) {
                            console.log(validation);
                        } else {
                            
                        }
                    }*/
                } else {
                    body.message.text = '/menu';
                    return this.storedProcedure(body);
                }
            } else {
                console.log('Continue with the other process and sending the next question');
                let answer: string = '';

                if (['ack'].includes(type)) {
                    let [_data] = data;
                    let _answer: IDataOptions = _data.options.find((item: IDataOptions) => item.votes == 1);
                    answer = _answer.name;
                } else if (['message'].includes(type)) {
                    if (['location'].includes(message.type)) {
                        answer = message.payload;
                    } else if (['text'].includes(message.type)) {
                        answer = message.text;
                    }
                }
                console.log([request.id, session.id, answer]);

                let questions = await this.connection.query('EXEC forms.SaveAnswerAndRetrieveNextQuestion @0, @1, @2;', [request.id, session.id, answer]);
                
                if (questions && questions.length) {
                    let [question] = questions;
                    console.log(question);
                    if (question.question_options) {
                        question.question_options = String(question.question_options).split(',');
                        console.log(question);
                    }
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
                        let { form_id } = _session;
                        
                        if (form_id) {
                            let [defaultCommand] = await this.connection.query('EXEC forms.ValidateCommand @0, @1;', ['', 1]);
                            console.log(defaultCommand);
                        }
                    }
                }
            }
        }
        return { success: true };
    }

    @Post('/excel')
    @ApiOperation({ deprecated: true })
    @UseInterceptors(FileInterceptor('file', {
        fileFilter: (_request: Request, file: Express.Multer.File, callback: (error: Error, acceptFile: boolean) => void) => {
            if (!Boolean(file.mimetype.match('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))) {
                callback(new HttpException(`Invalid file with extension ${file.mimetype}`, HttpStatus.BAD_REQUEST), false);
            }
            callback(null, true);
        }
    }))
    excelUpload(@UploadedFile() file: Express.Multer.File): { success: boolean } {
        this.whatsappService.excelCoahuila(file);
        return {
            success: true
        };
    }

}
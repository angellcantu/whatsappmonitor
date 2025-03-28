'use strict';

import { Logger, Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PhoneService } from "src/phone/phone.service";
import { Phone } from "src/phone/phone.entity";
import { Contact } from "src/contact/contact.entity";
import { ContactService } from "src/contact/contact.service";
import { GroupService } from "src/group/group.service";
import { IGroup } from "src/group/group.interface";
import { MessageService } from "src/message/message.service";
import { ConversationService } from "src/conversation/conversation.service";
import { Conversation } from "src/conversation/conversation.entity";
import { IConversation } from "src/conversation/conversation.interface";
import { IContact } from "src/contact/contact.interface";
import { IIntegrant } from "src/integrant/IIntegrant.interface";
import { IntegrantService } from "src/integrant/integrant.service";
import { Integrant } from "src/integrant/integrant.entity";
import { Group } from "src/group/group.entity";
import { Message } from "src/message/message.entity";
import { IMessage } from "src/message/message.interface";
import { MaytApiService } from './maytapi.service';
import { Connection } from 'typeorm';
import { IWebhook, IDataOptions, IWebhookDataBase } from './whatsapp.interface';
import { FtpService } from './ftp.service';
import * as xls from 'excel4node';
import * as ExcelToJson from 'convert-excel-to-json';

@Injectable()
export class WhatsappService {

    private readonly logger = new Logger('Webhook Service');

    constructor(
        private readonly phoneService: PhoneService,
        private readonly contactService: ContactService,
        private readonly groupService: GroupService,
        private readonly messageService: MessageService,
        private readonly conversationService: ConversationService,
        private readonly integrantService: IntegrantService,
        private readonly maytApi: MaytApiService,
        private readonly ftp: FtpService,
        private readonly config: ConfigService,
        private readonly connection: Connection
    ) {
    }

    // Esta es de prueba solamente
    async findAllPhones(): Promise<Phone[]> {
        return this.phoneService.findAllPhones();
    }

    // TODO: Work in this function in the future
    // Permite cargar la lista de phones a la base de datos
    async loadPhoneList(): Promise<void> {
        this.logger.log('Loading the phones');
    }

    async loadContacts(): Promise<void> {
        this.logger.log('Loading the contacts');

        const phoneIds: string[] = await this.phoneService.findAllPhoneIds();

        for (const id of phoneIds) {
            const contactList: any = await this.maytApi.getContactsByPhoneIdentifier(Number(id));

            if (!contactList.success) {
                return;
            }

            const _contacts: Array<IContact> = [];
            const contacts: Array<any> = contactList.data;
            const phone: Phone = await this.phoneService.findPhone(Number(id));

            for (const contact of contacts) {
                _contacts.push({
                    contact_id: contact.id,
                    name: contact.name,
                    type: contact.type,
                    phone: phone,
                    image: contact?.url?.image
                });
            }
            await this.contactService.createContacts(_contacts);
        }
        this.logger.log('Finished the process loading the contacts');
    }

    async loadImagesInContacts(): Promise<void> {
        this.logger.log('Loading the images contacts');

        try {
            const phoneIds: Array<string> = await this.phoneService.findAllPhoneIds();

            for (const id of phoneIds) {
                const contacts: Array<Contact> = await this.contactService.findAll();

                for (const contact of contacts) {
                    try {
                        const contactInfo: any = await this.maytApi.getContactInformation(String(contact.contact_id), Number(id));
                        this.logger.log(contactInfo);

                        if (!contactInfo.success || !contactInfo.data.length) {
                            continue;
                        }

                        const contactData = contactInfo.data[0];
                        var image: string = contactData.image.url;

                        if (image === '' || image === undefined) {
                            continue;
                        }

                        // here we will save the image in the server
                        let imageName: string = `${contact.id}.jpeg`;
                        let file = await this.maytApi.fetchImage(image);
                        this.ftp.saveLocalFile(file, { name: imageName });
                        await this.ftp.upload(`../../files/${imageName}`, `/img/contacts/${imageName}`);
                        this.ftp.removeFile(`../../files/${imageName}`);

                        await this.contactService.loadImage(contactData.id, `${this.config.get<string>('WEB_APPLICATION_URL')}/img/contacts/${imageName}`);
                    } catch (error) {
                        this.logger.error(error);
                        continue;
                    }
                }
            }

            this.logger.log('Finished the process to load the contacts images');
        } catch (error) {
            this.logger.error(error);
        }
    }

    async loadImagesInGroups(): Promise<void> {
        this.logger.log('Loading the images for each group');

        try {
            const phoneIds: Array<string> = await this.phoneService.findAllPhoneIds();

            for (const id of phoneIds) {
                const groups: Array<Group> = await this.groupService.findAllGroups();

                for (const group of groups) {
                    const groupData: any = await this.maytApi.getGroupInformation(group.id_group, Number(id));
                    this.logger.log(groupData);

                    if (!groupData.success || !groupData.data) {
                        continue;
                    }

                    let image: string = groupData?.data?.image;

                    if (image === '' || image == null) {
                        continue;
                    }

                    // here we will save the image in the server
                    let imageName: string = `${group.id}.jpeg`;
                    let file = await this.maytApi.fetchImage(image);
                    this.ftp.saveLocalFile(file, { name: imageName });
                    await this.ftp.upload(`../../files/${imageName}`, `/img/groups/${imageName}`);
                    this.ftp.removeFile(`../../files/${imageName}`);

                    await this.groupService.loadImage(group.id, `${this.config.get<string>('WEB_APPLICATION_URL')}/img/groups/${imageName}`);
                }
            }

            this.logger.log('Finished the process to load the groups images');
        } catch (error) {
            this.logger.error(error);
        }
    }

    async loadGroupsIntegrants(): Promise<void> {
        this.logger.log('Loading the members by each group');

        const groupIds: string[] = (await this.contactService.getGroupsId());
        const phoneIds: string[] = await this.phoneService.findAllPhoneIds();

        for (const id of phoneIds) {
            for (const contact_id of groupIds) {
                try {
                    const contact: Contact = await this.contactService.findOne(contact_id)
                    await this.createGroupFromAPI(id, contact_id, contact);
                } catch (error) {
                    this.logger.error(error);
                    continue;
                }

            }
        }

        this.logger.log('Finished the process to load the groups integrants');
    }

    async loadGroupConversations(): Promise<void> {
        this.logger.log('Getting the conversations');

        const phoneIds: Array<string> = await this.phoneService.findAllPhoneIds();

        for (const id of phoneIds) {
            const groupIds: string[] = ((await this.contactService.getGroupsId()));

            for (const contact_id of groupIds) {
                let conversationInfo: any;

                try {
                    conversationInfo = await this.maytApi.getConversation(contact_id, Number(id));
                } catch (error) {
                    this.logger.log('No se pudo traer la info de la conversacion');
                    this.logger.error(error);
                }

                try {
                    if (!conversationInfo.success || conversationInfo.data.length <= 0) {
                        const conversation: Conversation = new Conversation();
                        conversation.id_conversation = contact_id;

                        await this.conversationService.createConversation(conversation);
                        return;
                    }

                    const conversationData: any = conversationInfo.data;
                    const _messages: Message[] = [];

                    if (conversationData.messages.length > 0) {
                        for (const message of conversationData.messages) {
                            if (await this.validateMessageType(message)) { continue; }

                            const newMessage: IMessage = await this.messageAttributes(message)
                            _messages.push(await this.messageService.createMessage(newMessage));
                        }
                    }

                    const Iconversation: IConversation = {
                        id_conversation: contact_id,
                        messages: _messages
                    }

                    const conversation: Conversation = await this.conversationService.createConversation(Iconversation);

                    if (conversationData.participants.length > 0) {
                        for (const participant of conversationData.participants) {
                            const contact: Contact = await this.contactService.findOne(participant.id);
                            contact.conversations = [conversation];
                            await this.contactService.saveConversationInContact(contact);
                        }
                    }
                } catch (error) {
                    this.logger.error(error);
                }
            }
        }

        this.logger.log('Finished the process to loading the conversations');
    }

    async webhookValidation(response: IWebhook) {
        let phone_id: number = response?.phone_id;

        if (String(response?.conversation).length > 18) {
            await this.phoneService.findPhone(phone_id);

            /* validate message type for group invites or leaves */
            if (response?.message && response?.message?.type == 'info') {
                // validate subtype
                if (['group/invite', 'group/add'].includes(response?.message?.subtype)) {
                    // we will add the user in the group
                    this.groupInvite(response);
                }
                if (['group/leave'].includes(response?.message?.subtype)) {
                    // we will remove the user in the group
                    this.groupLeave(response);
                }
            }

            var newConversation: string = response?.conversation;
            const contact: Contact = await this.contactService.findOne(newConversation);

            if (contact) {
                const conversation: Conversation = await this.conversationService.findOne(newConversation);

                if (conversation) {
                    const group: Group = await this.groupService.findGroup(newConversation);

                    if (group) {
                        if (await this.validateMessageType(response)) {
                            return;
                        }

                        const interfaceMessage: IMessage = await this.assignAttributesInMessages(response);
                        if (interfaceMessage.uuid == null || interfaceMessage.uuid === "") {
                            return;
                        }
                        const newMessage = await this.messageService.createMessage(interfaceMessage);

                        await this.messageService.saveContactInMessage(newMessage, newMessage.contact, conversation);
                    } else {
                        await this.createGroupFromAPI(String(phone_id), newConversation, contact);
                        await this.createConversationFromAPI(String(phone_id), newConversation);
                    }
                } else {
                    if (await this.validateMessageType(response)) {
                        return;
                    }

                    const conversation: Conversation = new Conversation();
                    conversation.id_conversation = newConversation;
                    conversation.contacts = [contact];
                    await this.conversationService.createConversation(conversation);

                    const group: Group = await this.groupService.findGroup(newConversation);

                    if (group) {
                        const interfaceMessage: IMessage = await this.assignAttributesInMessages(response);

                        if (interfaceMessage.uuid == null || interfaceMessage.uuid === "") { return; }

                        const newMessage = await this.messageService.createMessage(interfaceMessage);

                        await this.messageService.saveContactInMessage(newMessage, newMessage.contact, conversation);
                    } else {
                        await this.createGroupFromAPI(String(phone_id), newConversation, contact);
                        await this.createConversationFromAPI(String(phone_id), newConversation);
                    }
                }
                this.logger.log('SE A INSERTADO UN MENSAJE NUEVO AL GRUPO');
            } else {
                try {
                    const newContact: Contact = await this.createContactFromAPI(String(phone_id), newConversation);
                    await this.createGroupFromAPI(String(phone_id), newConversation, newContact);
                    await this.createConversationFromAPI(String(phone_id), newConversation);

                    this.logger.log('SE CREO CORRECTAMENTE UN NUEVO GRUPO');
                } catch (error) {
                    this.logger.error(error);
                }
            }
        }

        if (String(response?.user?.id).length <= 18) {
            // return this.bot(response); TODO: discomment this line in the future
            return this.management(response);
        }
    }

    // Private methods

    /**
     * This function will add a user integrant in specific group
     * @param request IWebhook interface
     */
    private async groupInvite(request: IWebhook) {
        // get the group information
        const { message, conversation } = request;
        let group: Group = await this.groupService.findGroup(conversation);

        if (group) {
            let contact: Contact = await this.contactService.findOne(message?.participant);
            // if the contact does not exist then create it
            if (!contact) {
                let contactMaytApi = await this.maytApi.getContactInformation(message?.participant);
                if (contactMaytApi?.success && contactMaytApi?.data?.length) {
                    let [_contact] = contactMaytApi?.data;
                    contact = await this.contactService.createContact({
                        contact_id: _contact.id,
                        name: _contact.name,
                        type: _contact.type,
                        images: null,
                    });
                }
            }

            let integrant: Integrant = await this.integrantService.findOne(message?.participant);
            if (!integrant) {
                let integrantMaytApi = await this.maytApi.getContactInformation(message?.participant);
                if (integrantMaytApi?.success && integrantMaytApi?.data?.length) {
                    let [_integrant] = integrantMaytApi?.data;
                    let [number] = _integrant?.id.split('@');
                    let [_, first] = number?.split('521');
                    integrant = await this.integrantService.createIntegrant({
                        name: _integrant.name,
                        integrant_id: _integrant.id,
                        phone_number: first,
                        type: 'participant',
                        groups: [group],
                    });
                }
            }

            // add the integrant/contact to the group
            const actualIntegrants = await this.groupService.findIntegrantInGroup(group?.id_group);
            // update the new integrants in the group
            await this.groupService.updateGroupIntegrants(group, [...actualIntegrants?.integrants, integrant]);
            const integrantGroup = await this.groupService.findIntegrantInGroup(group.id_group);
            const existIntegrant = integrantGroup.integrants.find((item) => item.id_integrant === integrant.id_integrant);
            if (existIntegrant) {
                // send the notification
                const webhooks: Array<IWebhookDataBase> = await this.connection.query('EXEC administracion.GetActiveWebhooks');
                const webhookBody = {
                    type: message?.type,
                    subtype: message?.subtype,
                    group,
                    integrant,
                    time: new Date(),
                };

                // send broadcast
                webhooks.forEach((webhook: IWebhookDataBase) => {
                    this.logger.log(webhook.url);
                    this.logger.log(webhookBody);
                    this.maytApi.sendWebhook(webhook.url, webhookBody);
                });
            }
        }
    }

    /**
     * This function will leave a user integrant from specific group
     * @param request IWebhook interface
     */
    private async groupLeave(request: IWebhook) {
        // get group information
        const { message, conversation } = request;
        const group = await this.groupService.findGroup(conversation);

        if (group) {
            // get integrants
            const integrants: Group = await this.groupService.findIntegrantInGroup(conversation);
            const integrant: Integrant = integrants?.integrants.find((item: Integrant) => item.id_integrant === message?.participant);
            if (integrant) {
                const newIntegrants: Array<Integrant> = integrants?.integrants.filter((item: Integrant) => item.id_integrant != integrant?.id_integrant);
                // update the new integrant in the group
                await this.groupService.updateGroupIntegrants(group, [...newIntegrants]);
                // send the notification
                const webhooks: Array<IWebhookDataBase> = await this.connection.query('EXEC administracion.GetActiveWebhooks');
                const webhookBody = {
                    type: message?.type,
                    subtype: message?.subtype,
                    group,
                    integrant,
                    time: new Date(),
                };
                // send broadcast
                webhooks.forEach((webhook: IWebhookDataBase) => {
                    this.logger.log(webhook.url);
                    this.logger.log(webhookBody);
                    this.maytApi.sendWebhook(webhook?.url, webhookBody);
                });
            }
        }
    }

    private async management(body: IWebhook) {
        const { message, user } = body;

        if (message && !message?.fromMe) {
            // get the message
            const text: string = message?.text.trim().toLowerCase().replace(/[^\w\s]/gi, '');
            const pattern: RegExp = /(estatus|status)/g;

            if (text.match(pattern)) {
                const [first] = user?.id.split('@');
                const [_, phone] = first.split('521');
                const [request] = await this.connection.query('EXEC forms.GetLatestStatusManagement @0;', [phone]);

                if (request) {
                    this.maytApi.sendMessage(request?.whatsapp, user?.id).then(response => {
                        console.log(response);
                    });
                }
            }
        }
    }

    /**
     * This function will work with the bot
     * @param body maytapi request
     * @returns an object
     */
    private async bot(body: IWebhook) {
        let { message, user, type, data, phone_id } = body,
            userId: string = '';

        if (['ack'].includes(type) && !message) {
            let [item] = data;
            if (!item.options) {
                return { success: true };
            }
            body['message'] = {
                fromMe: false,
                type: 'poll'
            };
            return this.bot(body);
        } else if (['ack'].includes(type) && message) {
            let [item] = data;
            userId = item?.chatId;
        } else if (['message'].includes(type)) {
            userId = user?.id;
        }

        if (message && !message?.fromMe) {
            // save the request
            let [request] = await this.connection.query('EXEC forms.SaveRequests @0;', [userId]);

            // create the internal session
            let [session] = await this.connection.query('EXEC forms.CreateSessionRequest @0;', [request.id]);
            let { form_id } = session;

            if (!form_id && String(message.text).trim().toLowerCase().match(new RegExp('/menu'))) {
                let [_default] = await this.connection.query('EXEC forms.ValidateCommand @0, @1, @2;', ['', 2, request.id]);

                if (_default.name) {
                    this.maytApi.sendMessage(`${_default.message}${_default.name}`, userId, phone_id);
                } else {
                    let [_default] = await this.connection.query('EXEC forms.ValidateCommand @0, @1;', ['', 3]);
                    this.maytApi.sendMessage(`${_default.message}${_default.name}`, userId, phone_id);
                }
            } else if (!form_id && String(message?.text).match(new RegExp('/'))) {
                let [command] = await this.connection.query('EXEC forms.ValidateCommand @0;', [String(message.text)]);

                if (command) {
                    // get the form identifier by command identifier
                    let [form] = await this.connection.query('EXEC forms.GetFormIdentifierByCommandIdentifier @0;', [command.id]);
                    let { id } = form;

                    // validate if the user already fill the form
                    let validations = await this.connection.query('EXEC forms.ValidateIfFormIsFilled @0, @1;', [request.id, id]);

                    if (validations.length) {
                        let [validation] = validations;

                        if (validation.is_filled > 0) {
                            this.maytApi.sendMessage(validation.message, userId, phone_id);
                        } else {
                            // updating the form in the session request
                            let [formSessionRequest] = await this.connection.query('EXEC forms.UpdateFormToSessionRequest @0, @1;', [request.id, id]);

                            if (formSessionRequest) {
                                // we need to send the first message
                                let [question] = await this.connection.query('EXEC forms.SaveAnswerAndRetrieveNextQuestion @0, @1, @2;', [request.id, session.id, '']);
                                if (question.question_options) {
                                    let options: Array<string> = String(question.question_options).split(',');
                                    this.maytApi.sendPoll({
                                        phone: userId,
                                        message: question.name,
                                        options: options,
                                        phone_id: phone_id
                                    });
                                } else {
                                    this.maytApi.sendMessage(question.name, userId, phone_id);
                                }
                            }
                        }
                    }
                } else {
                    body.message.text = 'Hi';
                    return this.bot(body);
                }
            } else {
                let answer: string = '';

                if (['ack'].includes(type)) {
                    if (data && Array.isArray(data)) {
                        let [_data] = data;
                        if (_data.options) {
                            let _answer: IDataOptions = _data?.options.find((item: IDataOptions) => item.votes == 1);
                            answer = _answer?.name;
                        }
                    }
                } else if (['message'].includes(type)) {
                    if (['location'].includes(message?.type)) {
                        answer = message?.payload;
                    } else if (['text'].includes(message?.type)) {
                        answer = message?.text;
                    }
                }

                let questions = await this.connection.query('EXEC forms.SaveAnswerAndRetrieveNextQuestion @0, @1, @2;', [request.id, session.id, answer]);

                if (questions && questions.length) {
                    let [question] = questions;
                    if (question.question_options) {
                        let options: Array<string> = String(question.question_options).split(',');
                        this.maytApi.sendPoll({
                            phone: userId,
                            message: question.name,
                            options: options,
                            phone_id: phone_id
                        });
                    } else {
                        this.maytApi.sendMessage(question.name, userId, phone_id);
                    }
                } else {
                    // validate if the form has command response, this only apply if the form has a single question
                    let responses = await this.connection.query('EXEC forms.ValidateFormResponses @0;', [request.id]);

                    if (responses && responses.length) {
                        let [response] = responses;
                        let answers = await this.connection.query('EXEC forms.RetrieveFormResponse @0, @1, @2;', [response.name, request.id, session.id]);

                        if (answers && answers.length) {
                            let [answer] = answers;

                            // send the message
                            await this.maytApi.sendMessage(answer.name, userId, phone_id);

                            if (answer.latitude && answer.longitude) {
                                // send here the location
                                this.maytApi.sendLocation({
                                    latitude: answer.latitude,
                                    longitude: answer.longitude,
                                    phone: userId,
                                    phone_id: phone_id
                                });
                            }
                        }
                    }

                    // close the internal session
                    let [_session] = await this.connection.query('EXEC forms.ClosedSessionRequest @0;', [request.id]);

                    if (_session) {
                        let { form_id } = _session;

                        if (form_id) {
                            let [defaultCommand] = await this.connection.query('EXEC forms.ValidateCommand @0, @1;', ['', 1]);
                            this.maytApi.sendMessage(defaultCommand.name, userId, phone_id);
                        }
                    }
                }
            }
        }
    }

    /**
     * This function will work with the uat bot
     * @param body maytapi object
     * @returns object
     */
    async uatBot(body: IWebhook) {
        let { message, user, type, data, phone_id } = body,
            userId: string = '';

        if (['ack'].includes(type) && !message) {
            let [item] = data;
            if (!item.options) {
                return { success: true };
            }
            body['message'] = {
                fromMe: false,
                type: 'poll'
            };
            return this.uatBot(body);
        } else if (['ack'].includes(type) && message) {
            let [item] = data;
            userId = item?.chatId;
        } else if (['message'].includes(type)) {
            userId = user?.id;
        }

        if (message && !message?.fromMe) {
            // save the request
            let name: string = '';
            if (user) {
                name = user?.name;
            }
            let [request] = await this.connection.query('EXEC uat.SaveRequests @0, @1;', [userId, name || null]);

            // create the internal session
            let [session] = await this.connection.query('EXEC uat.CreateSessionRequest @0;', [request.id]);
            let { form_id } = session;

            if (!form_id && String(message.text).trim().toLowerCase().match(new RegExp('/menu'))) {
                let [_default] = await this.connection.query('EXEC uat.ValidateCommand @0, @1, @2;', ['', 2, request.id]);

                if (_default.name) {
                    this.maytApi.sendMessage(`${_default.message}${_default.name}`, userId, phone_id);
                } else {
                    let [_default] = await this.connection.query('EXEC uat.ValidateCommand @0, @1;', ['', 3]);
                    this.maytApi.sendMessage(`${_default.message}${_default.name}`, userId, phone_id);
                }
            } else if (!form_id && (message && /[\d/]+/g.test(String(message.text).trim()))) {
                let [_, text] = String(message.text).trim().split('/');
                let [command] = await this.connection.query('EXEC uat.ValidateCommand @0;', [`/${text}`]);

                if (command) {
                    // get the form identifier by command identifier
                    let [form] = await this.connection.query('EXEC uat.GetFormIdentifierByCommandIdentifier @0;', [command.id]);
                    let { id } = form;

                    // validate if the user already fill the form
                    let validations = await this.connection.query('EXEC uat.ValidateIfFormIsFilled @0, @1;', [request.id, id]);

                    if (validations.length) {
                        let [validation] = validations;

                        if (validation.is_filled > 0 && validation.answer != 'No') {
                            this.maytApi.sendMessage(validation.message, userId, phone_id);
                        } else {
                            // updating the form in the session request
                            let [formSessionRequest] = await this.connection.query('EXEC uat.UpdateFormToSessionRequest @0, @1;', [request.id, id]);

                            if (formSessionRequest) {
                                // we need to send the first message
                                let [question] = await this.connection.query('EXEC uat.SaveAnswerAndRetrieveNextQuestion @0, @1, @2;', [request.id, session.id, '']);

                                if (question.question_options) {
                                    let options: Array<string> = String(question.question_options).split(',');
                                    this.maytApi.sendPoll({
                                        phone: userId,
                                        message: question.name,
                                        options: options,
                                        phone_id: phone_id
                                    });
                                } else {
                                    this.maytApi.sendMessage(question.name, userId, phone_id);
                                }
                            }
                        }
                    }
                } else {
                    body.message.text = 'Hi';
                    return this.uatBot(body);
                }
            } else {
                let answer: string = '';

                if (['ack'].includes(type)) {
                    if (data && Array.isArray(data)) {
                        let [_data] = data;
                        if (_data.options) {
                            let _answer: IDataOptions = _data?.options.find((item: IDataOptions) => item.votes == 1);
                            answer = _answer?.name;
                        }
                    }
                } else if (['message'].includes(type)) {
                    if (['location'].includes(message?.type)) {
                        answer = message?.payload;
                    } else if (['text'].includes(message?.type)) {
                        answer = message?.text;
                    }
                }

                let questions = await this.connection.query('EXEC uat.SaveAnswerAndRetrieveNextQuestion @0, @1, @2;', [request.id, session.id, answer]);

                // validate the initial answer
                let formResponse: boolean = await this.validateUATFormResponses({
                    request_id: request.id,
                    session_id: session.id,
                    user_id: userId,
                    phone_id: phone_id
                });

                if (!formResponse) {
                    if (questions && questions.length) {
                        let [question] = questions;
                        if (question.question_options) {
                            let options: Array<string> = String(question.question_options).split(',');
                            this.maytApi.sendPoll({
                                phone: userId,
                                message: question.name,
                                options: options,
                                phone_id: phone_id
                            });
                        } else {
                            this.maytApi.sendMessage(question.name, userId, phone_id);
                        }
                    } else {
                        // close the internal session
                        let [_session] = await this.connection.query('EXEC uat.ClosedSessionRequest @0;', [request.id]);

                        if (_session) {
                            let { form_id } = _session;

                            if (form_id) {
                                let [defaultCommand] = await this.connection.query('EXEC uat.ValidateCommand @0, @1;', ['', 1]);
                                this.maytApi.sendMessage(defaultCommand.name, userId, phone_id);
                            }
                        }
                    }
                } else {
                    // close the internal session
                    await this.connection.query('EXEC uat.ClosedSessionRequest @0;', [request.id]);
                }
            }
        }
    }

    private async validateUATFormResponses(params: { request_id: number, session_id: number, user_id: string, phone_id: number }): Promise<boolean> {
        // validate if the form has command response, this only apply if the form has a single question
        let responses = await this.connection.query('EXEC uat.ValidateFormResponses @0;', [params.request_id]);

        if (responses && responses.length) {
            let [response] = responses;
            let answers = await this.connection.query('EXEC uat.RetrieveFormResponse @0, @1, @2;', [response.name, params.request_id, params.session_id]);

            if (answers && answers.length) {
                let [answer] = answers;

                // send the message
                await this.maytApi.sendMessage(answer.name, params.user_id, params.phone_id);

                if (answer.latitude && answer.longitude) {
                    // send here the location
                    this.maytApi.sendLocation({
                        latitude: answer.latitude,
                        longitude: answer.longitude,
                        phone: params.user_id,
                        phone_id: params.phone_id
                    });
                }
                return true;
            }
        }
        return false;
    }

    private async createGroupFromAPI(phone_id: string, group_id: string, contact: Contact): Promise<Group | undefined> {
        try {
            const groupRes: any = await this.maytApi.getGroupInformation(group_id, Number(phone_id));
            const resGroupInfo: any = groupRes?.data;

            if (!groupRes.success || groupRes.data <= 0) { return; }

            const newGroup: IGroup = {
                id_group: contact.contact_id,
                name: contact.name,
                image: contact.image
            }

            if (newGroup.name === null || newGroup.name === "") { return; }

            const createdGroup: Group = await this.groupService.findOrCreate(newGroup);
            const integrants: Integrant[] = await this.createIntegrantsInGroupFromAPI(createdGroup, resGroupInfo);

            return createdGroup;
        } catch (error) {
            console.log(error);
        }
    }

    private async createIntegrantsInGroupFromAPI(group: Group, resGroupInfo: any): Promise<Integrant[] | undefined> {
        try {
            var arrayIntegrants: Integrant[] = [];

            if (resGroupInfo.admins.length > 0) {
                for (const admin of resGroupInfo.admins) {
                    const contact: Contact = await this.contactService.findOne(admin);
                    const integra: IIntegrant = {
                        integrant_id: admin,
                        name: contact.name,
                        phone_number: admin.substring(0, 10),
                        type: 'admin',
                    }

                    arrayIntegrants.push(await this.integrantService.createIntegrant(integra));
                }
            }

            if (resGroupInfo.participants.length > 0) {
                for (const participant of resGroupInfo.participants) {
                    const contact: Contact = await this.contactService.findOne(participant);
                    const integra: IIntegrant = {
                        integrant_id: participant,
                        name: contact.name,
                        phone_number: participant.substring(0, 10),
                        type: 'participant',
                    }

                    arrayIntegrants.push(await this.integrantService.createIntegrant(integra));
                }
            }

            if (arrayIntegrants.length > 0) {
                await this.groupService.updateGroupIntegrants(group, arrayIntegrants);
            } else {
                return;
            }
            return arrayIntegrants;
        } catch (error) {

        }
    }

    private async createContactFromAPI(phone_id: string, contact_id: string): Promise<Contact | undefined> {
        try {
            const phone: Phone = await this.phoneService.findPhone(Number(phone_id));
            const res: any = await this.maytApi.getContactInformation(contact_id);
            const resInfo: any = res?.data[0];

            const newContact: IContact = {
                contact_id: resInfo?.id,
                name: resInfo?.name,
                type: 'group',
                phone: phone,
                image: resInfo?.url?.image
            }

            const contact: Contact = await this.contactService.createContact(newContact);
            return contact;
        } catch (error) {
            console.log(error);
        }
    }

    private async createConversationFromAPI(phone_id: string, conversation_id: string): Promise<Conversation | undefined> {
        try {
            const conversationInfo = await this.maytApi.getConversation(conversation_id);
            const conversationData = conversationInfo?.data;

            const _messages: Message[] = [];
            if (conversationData.messages.length > 0) {
                for (const message of conversationData.messages) {
                    if (await this.validateMessageType(message)) { continue; }

                    const newMessage: IMessage = await this.messageAttributes(message)
                    _messages.push(await this.messageService.createMessage(newMessage));
                }
            }
            const conversation: Conversation = await this.createConversation(
                conversation_id,
                _messages
            );

            if (conversationData.participants.length > 0) {
                for (const participant of conversationData.participants) {
                    const contact: Contact = await this.contactService.findOne(participant.id);
                    contact.conversations = [conversation];
                    await this.contactService.saveConversationInContact(contact);
                }
            }
            return conversation;
        } catch (error) {
            console.log(error);
        }
    }

    private async createConversation(conversation_name: string, messages: Message[]): Promise<Conversation | undefined> {
        try {
            const Iconversation: IConversation = {
                id_conversation: conversation_name,
                messages: messages
            }

            const conversation: Conversation = await this.conversationService.createConversation(Iconversation);

            return conversation;
        } catch (error) {
            console.log(error);
        }
    }

    private async createMessage(response: any): Promise<Message | undefined> {
        try {
            const interfaceMessage: IMessage = await this.assignAttributesInMessages(response);
            return;
        } catch (error) {
            console.log(error);
        }
    }

    private async validateMessageType(message: any): Promise<boolean> {
        const type: string = message?.message?.type;
        if (type === "info" || type === "ack") {
            return true;
        }
        return false;
    }

    // HAY QUE REFACTORIZAR ESTE CODIGO CON EL DE ABAJO, SE HACE SOLO PARA PRUEBAS
    private async assignAttributesInMessages(message: any): Promise<IMessage> {
        const interfaceMessage: IMessage = {
            contact: await this.contactService.findOne(message?.user?.id),
            uuid: message?.user?.id,
            type: message?.message?.type,
            text: message?.message?.text ?? null,
            url: message?.message?.url ?? null,
            mime: message?.message?.mime ?? null,
            filename: message?.message?.filename ?? null,
            caption: message?.message?.caption ?? null,
            payload: message?.message?.payload ?? null,
            subtype: message?.mesage?.subtype ?? null,
            participant: message?.message?.participant?._serialized ?? null,
            _serialized: message?.message?._serialized ?? null
        }
        return interfaceMessage;
    }

    private async assignMessageAttributes(contact_id: string, uuid: string, messageInfo: any): Promise<IMessage> {
        try {
            const message: IMessage = {
                contact: await this.contactService.findOne(contact_id),
                uuid: uuid,
                type: messageInfo?.message?.type,
                text: messageInfo?.message?.text ?? null,
                url: messageInfo?.message?.url ?? null,
                mime: messageInfo?.message?.mime ?? null,
                filename: messageInfo?.message?.filename ?? null,
                caption: messageInfo?.message?.caption ?? null,
                payload: messageInfo?.message?.payload ?? null,
                subtype: messageInfo?.mesage?.subtype ?? null,
                participant: messageInfo?.message?.participant?._serialized ?? null,
                _serialized: messageInfo?.message?._serialized ?? null
            }

            return message;
        } catch (error) {
            console.log(error);
        }
    }

    private async messageAttributes(messageInfo: any): Promise<IMessage> {
        const message: IMessage = {
            contact: await this.contactService.findOne(messageInfo.uid),
            uuid: messageInfo?.uid,
            type: messageInfo?.message?.type,
            text: messageInfo?.message?.text ?? null,
            url: messageInfo?.message?.url ?? null,
            mime: messageInfo?.message?.mime ?? null,
            filename: messageInfo?.message?.filename ?? null,
            caption: messageInfo?.message?.caption ?? null,
            payload: messageInfo?.message?.payload ?? null,
            subtype: messageInfo?.mesage?.subtype ?? null,
            participant: messageInfo?.message?.participant?._serialized ?? null,
            _serialized: messageInfo?.message?._serialized ?? null
        }

        return message;
    }

    excelUpload(file: Express.Multer.File) {
        let sheets = ExcelToJson({
            source: file.buffer,
            sheets: [
                { name: 'Casillas2024', header: { rows: 1 } }
            ]
        });
        let { Casillas2024: sheet } = sheets;

        if (Array.isArray(sheet)) {
            sheet.map(async item => {
                let response = await this.connection.query('EXEC forms.addBox @0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11, @12, @13, @14, @15, @16, @17, @18, @19, @20', [
                    item.A,
                    item.B,
                    item.C,
                    item.D,
                    item.E,
                    item.F,
                    item.G,
                    item.H,
                    item.I,
                    item.J,
                    item.K,
                    item.L,
                    item.M,
                    item.O,
                    item.N,
                    item.P,
                    item.Q,
                    item.R,
                    item.S,
                    item.T,
                    item.U
                ]);
                this.logger.log(response);
            });
        }
    }

    excelCoahuila(file: Express.Multer.File) {
        const sheets = ExcelToJson({
            source: file.buffer,
            sheets: [
                { name: 'Coahuila 29 enero FINAL', header: { rows: 1 } },
            ],
        });
        const problems = ['limpieza', 'vigilancia', 'banquetas', 'alumbrado', 'baches'];
        const items = [...sheets['Coahuila 29 enero FINAL']];
        const uniqueMunicipalities = [...new Set(items.map(item => item.C))];
        const municipalities = [];

        uniqueMunicipalities.map((municipality: string) => {
            const record = { name: municipality };
            const filtered = items.filter(item => item.C === municipality);
            if (filtered.length) {
                record['suburbs'] = filtered;
                municipalities.push(record);
            }
            return municipality;
        });
        //
        municipalities.forEach(municipality => {
            const suburbs = [...municipality.suburbs];
            municipality.suburbs = suburbs.map(suburb => {
                const item = {};
                if (typeof suburb.G === 'string') {
                    item['suburb'] = String(suburb.G).toLowerCase().replace(/[^a-zA-Z ]/g, '');
                    const suburbProblems = String(suburb.AO).toLowerCase().replace(/[^a-zA-Z ]/g, '').split(/\s*\b\s*/);
                    problems.forEach((attr: string) => {
                        item[attr] = suburbProblems.includes(attr) ? 1 : 0;
                    });
                }
                return item;
            });
        });
        //
        municipalities.forEach(municipality => {
            const uniques = [];
            municipality.suburbs.forEach(item => {
                const index = uniques.findIndex(unique => item.suburb === unique.suburb);
                if (index > -1) {
                    uniques[index]['limpieza'] = uniques[index]['limpieza'] + item['limpieza'];
                    uniques[index]['vigilancia'] = uniques[index]['limpieza'] + item['vigilancia'];
                    uniques[index]['banquetas'] = uniques[index]['limpieza'] + item['banquetas'];
                    uniques[index]['alumbrado'] = uniques[index]['limpieza'] + item['alumbrado'];
                    uniques[index]['baches'] = uniques[index]['limpieza'] + item['baches'];
                } else {
                    uniques.push(item);
                }
            });
            municipality.suburbs = uniques;
        });

        console.log(JSON.stringify(municipalities));

        // creating the excel file
        const wb = new xls.Workbook();
        const ws = wb.addWorksheet('Sheet 1');

        ws.cell(1, 1).string('#');
        ws.cell(1, 2).string('Municipio');
        ws.cell(1, 3).string('Colonia');
        ws.cell(1, 4).string('Limpieza');
        ws.cell(1, 5).string('Vigilancia');
        ws.cell(1, 6).string('Banquetas');
        ws.cell(1, 7).string('Alumbrado');
        ws.cell(1, 8).string('Baches');

        // loop the array
        let index: number = 1;
        municipalities.forEach(municipality => {
            municipality.suburbs.forEach((suburb) => {
                if (typeof suburb.suburb != 'undefined') {
                    index++;
                    this.logger.log(`Municipio: ${municipality.name}, Colonia: ${suburb.suburb}`);
                    ws.cell(index, 1).number(index - 1);
                    ws.cell(index, 2).string(municipality.name);
                    ws.cell(index, 3).string(suburb.suburb);
                    ws.cell(index, 4).number(suburb.limpieza);
                    ws.cell(index, 5).number(suburb.vigilancia);
                    ws.cell(index, 6).number(suburb.banquetas);
                    ws.cell(index, 7).number(suburb.alumbrado);
                    ws.cell(index, 8).number(suburb.baches);
                }
            });
        });

        wb.write('Coahuila.xlsx');
    }

}
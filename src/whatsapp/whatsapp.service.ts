'use strict';

import { Logger, Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
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
import { IWebhook, IDataOptions } from './whatsapp.interface';
import { FtpService } from './ftp.service';
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
            const contacts: Array<Contact> = await this.contactService.findAll();

            for (const contact of contacts) {
                try {
                    const contactInfo: any = await this.maytApi.getContactInformation(String(contact.contact_id));
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

            this.logger.log('Finished the process to load the contacts images');
        } catch (error) {
            this.logger.error(error);
        }
    }

    async loadImagesInGroups(): Promise<void> {
        this.logger.log('Loading the images for each group');

        try {
            const groups: Array<Group> = await this.groupService.findAllGroups();
            
            for (const group of groups) {
                const groupData: any = await this.maytApi.getGroupInformation(group.id_group);
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

        const groupIds: string[] = ((await this.contactService.getGroupsId()));
        
        for (const contact_id of groupIds) {
            let conversationInfo: any;
            
            try {
                conversationInfo = await this.maytApi.getConversation(contact_id);
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

        this.logger.log('Finished the process to loading the conversations');
    }

    async webhookValidation(response: IWebhook) {
        let phone_id: number = response?.phone_id;

        if (String(response?.user?.id).length > 18) {
            await this.phoneService.findPhone(phone_id);
            
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
            return this.bot(response);
        }
    }

    // Private methods
    private async bot(body: IWebhook) {
        let { message, user, type, data } = body,
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
                    this.maytApi.sendMessage(`${_default.message}${_default.name}`, userId);
                } else {
                    let [_default] = await this.connection.query('EXEC forms.ValidateCommand @0, @1;', ['', 3]);
                    this.maytApi.sendMessage(`${_default.message}${_default.name}`, userId);
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
                            this.maytApi.sendMessage(validation.message, userId);
                        } else {
                            // updating the form in the session request
                            let [formSessionRequest] = await this.connection.query('EXEC forms.UpdateFormToSessionRequest @0, @1;', [request.id, id]);
            
                            if (formSessionRequest) {
                                // we need to send the first message
                                let [question] = await this.connection.query('EXEC forms.SaveAnswerAndRetrieveNextQuestion @0, @1, @2;', [request.id, session.id, '']);
                                if (question.question_options) {
                                    let options: Array<string> = String(question.question_options).split(',');
                                    this.maytApi.sendPoll(userId, question.name, options);
                                } else {
                                    this.maytApi.sendMessage(question.name, userId);
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
                        this.maytApi.sendPoll(userId, question.name, options);
                    } else {
                        this.maytApi.sendMessage(question.name, userId);
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
                            await this.maytApi.sendMessage(answer.name, userId);
                            
                            if (answer.latitude && answer.longitude) {
                                // send here the location
                                this.maytApi.sendLocation(answer.latitude, answer.longitude, userId);
                            }
                        }
                    }

                    // close the internal session
                    let [_session] = await this.connection.query('EXEC forms.ClosedSessionRequest @0;', [request.id]);
                    
                    if (_session) {
                        let { form_id } = _session;
                        
                        if (form_id) {
                            let [defaultCommand] = await this.connection.query('EXEC forms.ValidateCommand @0, @1;', ['', 1]);
                            this.maytApi.sendMessage(defaultCommand.name, userId);
                        }
                    }
                }
            }
        }
        return { success: true };
    }

    private async createGroupFromAPI(phone_id: string, group_id: string, contact: Contact): Promise<Group | undefined> {
        try {
            const groupRes: any = await this.maytApi.getGroupInformation(group_id);
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

}
'use strict';

import { Inject, Injectable } from "@nestjs/common";
import * as rp from 'request-promise-native';
import { PhoneService } from "src/phone/phone.service";
import { Phone } from "src/phone/phone.entity";
import { parse } from "path";
import { Contact } from "src/contact/contact.entity";
import { ContactService } from "src/contact/contact.service";
import { GroupService } from "src/group/group.service";
import { IGroup } from "src/group/group.interface";
import { group } from "console";
import { MessageService } from "src/message/message.service";
import { ConversationService } from "src/conversation/conversation.service";
import { Conversation } from "src/conversation/conversation.entity";
import { concatAll } from "rxjs";
import { IConversation } from "src/conversation/conversation.interface";
import { IPhone } from "src/phone/phone.interface";
import { IContact } from "src/contact/contact.interface";
import { IIntegrant } from "src/integrant/IIntegrant.interface";
import { IntegrantService } from "src/integrant/integrant.service";
import { Integrant } from "src/integrant/integrant.entity";
import { Group } from "src/group/group.entity";
import { Message } from "src/message/message.entity";
import { IMessage } from "src/message/message.interface";
import { MaytApiService } from './maytapi.service';
import { Connection } from 'typeorm';

@Injectable()
export class WhatsappService {
    constructor(
        private readonly phoneService: PhoneService,
        private readonly contactService: ContactService,
        private readonly groupService: GroupService,
        private readonly messageService: MessageService,
        private readonly conversationService: ConversationService,
        private readonly integrantService: IntegrantService,
        private readonly maytApi: MaytApiService,
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
        const listPhones: any[] = await this.Apiconnection('/listPhones');
        /*const _phones: IPhone[] = [];
        for (const phone of listPhones) {
            _phones.push({
                phone_id: phone.id,
                number: phone.number,
                status: phone.status,
                type: phone.type,
                name: phone.name,
                data: JSON.stringify(phone.data),
                multi_device: phone.multi_device
            });
        }
        await this.phoneService.createPhones(_phones);*/
    }

    async loadContacts(): Promise<void> {
        const phoneIds: string[] = await this.phoneService.findAllPhoneIds();

        for (const id of phoneIds) {
            const contactList: any = await this.Apiconnection(`${id}/contacts`);

            if (!contactList.success || contactList.data <= 0) {
                return;
            }

            const _contacts: IContact[] = [];
            const contacts: any[] = contactList.data;
            const phone: Phone = await this.phoneService.findPhone(parseInt(id));

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
    }

    async loadImagesInContacts(): Promise<void> {
        try {
            const phoneIds: string[] = await this.phoneService.findAllPhoneIds();

            for (const id of phoneIds) {
                const contacts: Contact[] = await this.contactService.findAll();

                for (const contact of contacts) {
                    try {
                        const contactInfo: any = await this.Apiconnection(`${id}/contact/${contact.contact_id}`);
                        if (!contactInfo.success || !contactInfo.data) {
                            continue;
                        }
                        const contactData = contactInfo.data[0];

                        var image: string = contactData.image.url;
                        const contact_id: string = contactData.id;
                        if (image === "" || image === undefined) {
                            continue;
                        }
                        await this.contactService.loadImage(contact_id, image);

                    } catch (error) {
                        continue;
                    }
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    async loadImagesInGroups(): Promise<void>{
        try {
            const phoneIds: string[] = await this.phoneService.findAllPhoneIds();
            for (const id of phoneIds) {
                const groups: Group[] = await this.groupService.findAllGroups();
                for (const group of groups) {
                    const groupData: any = await this.Apiconnection(`${id}/getGroups/${group.id_group}`);
                    if (!groupData.success || !groupData.data) {
                        continue;
                    }
                    const groupResponse = groupData.data;

                    const image: string = groupResponse.image;
                    if (image === "" || image == null) { continue; }
                    await this.groupService.loadImage(group.id_group, image);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async loadGroupsIntegrants(): Promise<void> {
        const groupIds: string[] = (await this.contactService.getGroupsId());
        const phoneIds: string[] = await this.phoneService.findAllPhoneIds();

        for (const id of phoneIds) {
            for (const contact_id of groupIds) {
                try {
                    const contact: Contact = await this.contactService.findOne(contact_id)
                    await this.createGroupFromAPI(id, contact_id, contact);
                } catch (error) {
                    console.log(error);
                    continue;
                }

            }
        }
    }

    async loadGroupConversations(): Promise<void> {
        // Traer los nombres de los grupos
        const phoneIds: string[] = await this.phoneService.findAllPhoneIds();

        const groupIds: string[] = ((await this.contactService.getGroupsId()));
        for (const id of phoneIds) {
            for (const contact_id of groupIds) {

                let conversationInfo: any;
                // const conversationInfo: any = await this.Apiconnection(`${id}/getConversations/${contact_id}`);
                try {
                    conversationInfo = await this.Apiconnection(`${id}/getConversations/${contact_id}`);
                } catch (error) {
                    console.log('No se pudo traer la info de la conversacion');
                    console.log(error);
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
                    console.log(conversationData.messages);
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
                    console.log(error)
                }
            }
        }
    }

    async webhookValidation(response: any) {
        const phone: Phone = await this.phoneService.findPhone(parseInt(response?.phone_id));

        var newConversation: string = response?.conversation;
        const conversation_name: string = response?.conversation_name;
        const type: string = response?.type;

        const contact: Contact = await this.contactService.findOne(newConversation);

        console.log(contact)
        if (contact) {
            const conversation: Conversation = await this.conversationService.findOne(newConversation);
            if (conversation) {
                const group: Group = await this.groupService.findGroup(newConversation);
                if (group) {
                    if (await this.validateMessageType(response)) { return; }

                    const interfaceMessage: IMessage = await this.assignAttributesInMessages(response);
                    console.log(interfaceMessage);
    
                    if (interfaceMessage.uuid == null || interfaceMessage.uuid === "") { return; }
                    const newMessage = await this.messageService.createMessage(interfaceMessage);
    
                    // Buscar la conversacion en mi contacto
                    await this.messageService.saveContactInMessage(newMessage, newMessage.contact, conversation);
                } else {
                    const createdGroup: Group = await this.createGroupFromAPI(response?.phone_id, newConversation, contact);
                    const createdConversation: Conversation = await this.createConversationFromAPI(response?.phone_id, newConversation);
                    console.log(createdConversation);
                }
                // crear un mensaje

            } else {
                // Create conversation
                if (await this.validateMessageType(response)) { return; }

                const conversation: Conversation = new Conversation();
                conversation.id_conversation = newConversation;
                conversation.contacts = [contact];

                await this.conversationService.createConversation(conversation);
                const group: Group = await this.groupService.findGroup(newConversation);
                if (group) {
                    const interfaceMessage: IMessage = await this.assignAttributesInMessages(response);
                    console.log(interfaceMessage)
    
                    if (interfaceMessage.uuid == null || interfaceMessage.uuid === "") { return; }
    
                    const newMessage = await this.messageService.createMessage(interfaceMessage);
    
                    await this.messageService.saveContactInMessage(newMessage, newMessage.contact, conversation);
                } else {
                    const createdGroup: Group = await this.createGroupFromAPI(response?.phone_id, newConversation, contact);
                    const createdConversation: Conversation = await this.createConversationFromAPI(response?.phone_id, newConversation);
                }

            }

            console.log("SE A INSERTADO UN MENSAJE NUEVO AL GRUPO");
        } else {
            try {
                const newContact: Contact = await this.createContactFromAPI(response?.phone_id, newConversation);
                console.log(newContact);
                const group: Group = await this.createGroupFromAPI(response?.phone_id, newConversation, newContact);
                console.log(group);
                const createdConversation: Conversation = await this.createConversationFromAPI(response?.phone_id, newConversation);
                console.log(createdConversation);

                console.log("SE CREO CORRECTAMENTE UN NUEVO GRUPO");
            } catch (error) {
                console.log(error);
            }
        }
        
        if (String(response.user.id).length <= 18) {
            return this.bot(response);
        }
    }

    // Private methods
    private async bot(body: any) {
        let { message, user } = body;

        if (!message.fromMe) {
            // save the request
            let [request] = await this.connection.query('EXEC forms.SaveRequests @0;', [user.id]);

            // create the internal session
            let [session] = await this.connection.query('EXEC forms.CreateSessionRequest @0;', [request.id]);
            let { form_id } = session;

            if (!form_id && !String(message.text).match(new RegExp('/'))) {
                let [_default] = await this.connection.query('EXEC forms.ValidateCommand @0, @1;', ['', 2]);
                this.maytApi.sendMessage(`${_default.message}${_default.name}`, user.id);
            } else if (!form_id && String(message.text).match(new RegExp('/'))) {
                let [command] = await this.connection.query('EXEC forms.ValidateCommand @0;', [String(message.text)]);
    
                if (command) {
                    // get the form identifier by command identifier
                    let [form] = await this.connection.query('EXEC forms.GetFormIdentifierByCommandIdentifier @0;', [command.id]);
                    let { id } = form;
    
                    // updating the form in the session request
                    let [formSessionRequest] = await this.connection.query('EXEC forms.UpdateFormToSessionRequest @0, @1;', [request.id, id]);
    
                    if (formSessionRequest) {
                        // we need to send the first message
                        let [question] = await this.connection.query('EXEC forms.SaveAnswerAndRetrieveNextQuestion @0, @1, @2;', [request.id, session.id, '']);
                        this.maytApi.sendMessage(question.name, user.id);
                    }
                } else {
                    body.message.text = 'Hi';
                    return this.bot(body);
                }
            } else {
                let answer: string = '';

                if (message.type == 'location') {
                    answer = message.payload;
                } else if (message.type == 'text') {
                    answer = message.text;
                }

                let questions = await this.connection.query('EXEC forms.SaveAnswerAndRetrieveNextQuestion @0, @1, @2;', [request.id, session.id, answer]);
                
                if (questions && questions.length) {
                    let [question] = questions;
                    this.maytApi.sendMessage(question.name, user.id);
                } else {
                    // validate if the form has command response, this only apply if the form has a single question
                    let responses = await this.connection.query('forms.ValidateFormResponses @0;', [request.id]);

                    if (responses && responses.length) {
                        let [response] = responses;
                        let answers = await this.connection.query('forms.RetrieveFormResponse @0, @1, @2;', [response.name, request.id, session.id]);

                        if (answers && answers.length) {
                            let [answer] = answers;

                            // send the message
                            await this.maytApi.sendMessage(answer.name, user.id);
                            
                            if (answer.latitude && answer.longitude) {
                                // send here the location
                                this.maytApi.sendLocation(answer.latitude, answer.longitude, user.id);
                            }
                        }
                    }

                    // close the internal session
                    let [_session] = await this.connection.query('EXEC forms.ClosedSessionRequest @0;', [request.id]);
                    
                    if (_session) {
                        let [defaultCommand] = await this.connection.query('EXEC forms.ValidateCommand @0, @1;', ['', 1]);
                        this.maytApi.sendMessage(defaultCommand.name, user.id);
                    }
                }
            }
        }
        return { success: true };
    }

    private async createGroupFromAPI(phone_id: string, group_id: string, contact: Contact): Promise<Group | undefined> {
        try {
            const groupRes: any = await this.Apiconnection(`${phone_id}/getGroups/${group_id}`);
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
            const phone: Phone = await this.phoneService.findPhone(parseInt(phone_id));
            const res: any = await this.Apiconnection(`${phone_id}/contact/${contact_id}`);
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
            const conversationInfo = await this.Apiconnection(`${phone_id}/getConversations/${conversation_id}`);
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
        if (type === "info" || type === "ack") { return true; }

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

    private async Apiconnection(endpoint: string): Promise<any> {
        const instance_url = "https://api.maytapi.com/api";
        const product_id = "fb28146b-94d3-4f7c-a991-e43392da62de";
        const api_token = "e938de62-dcc8-4beb-8916-32de34374f65";

        try {
            const url = `${instance_url}/${product_id}/`
            console.log(`${url}${endpoint}`);
            const response = await rp(`${url}${endpoint}`, {
                method: 'get',
                json: true,
                headers: {
                    'x-maytapi-key': api_token
                }
            });
            if (response.length < 1) {
                console.log(response.message)
                throw new Error(response.message)
            }

            return response;
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }
}
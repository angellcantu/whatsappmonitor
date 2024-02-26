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

@Injectable()
export class WhatsappService {
    constructor(
        private readonly phoneService: PhoneService,
        private readonly contactService: ContactService,
        private readonly groupService: GroupService,
        private readonly messageService: MessageService,
        private readonly conversationService: ConversationService,
        private readonly integrantService: IntegrantService
    ) {
    }

    // Esta es de prueba solamente
    async findAllPhones(): Promise<Phone[]> {
        return this.phoneService.findAllPhones();
    }

    // Permite cargar la lista de phones a la base de datos
    async loadPhoneList(): Promise<void> {
        const listPhones: any[] = await this.Apiconnection('/listPhones');
        const _phones: IPhone[] = [];
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
        await this.phoneService.createPhones(_phones);
    }

    async loadContacts(): Promise<void> {
        const phoneIds: string[] = await this.phoneService.findAllPhoneIds();

        for (const id of phoneIds) {
            const contactList: any = await this.Apiconnection(`${id}/contacts`);

            if (!contactList.success || contactList.data <= 0) {
                return;
            }

            console.log(contactList)
            const _contacts: IContact[] = [];
            const contacts: any[] = contactList.data;
            const phone: Phone = await this.phoneService.findPhone(parseInt(id));

            for (const contact of contacts) {
                _contacts.push({
                    contact_id: contact.id,
                    name: contact.name,
                    type: contact.type,
                    phone: phone
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
                        if (contactData.image.url === "") {
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

    async loadGroupsIntegrants(): Promise<void> {
        const groupIds: string[] = (await this.contactService.getGroupsId());
        const phoneIds: string[] = await this.phoneService.findAllPhoneIds();

        for (const id of phoneIds) {
            for (const contact_id of groupIds) {
                try {
                    const groupInfo: any = await this.Apiconnection(`${id}/getGroups/${contact_id}`);

                    if (!groupInfo.success || groupInfo.data <= 0) { return; }
                    const groupData: any = groupInfo.data;
                    const _group: IGroup = {
                        id_group: contact_id,
                        name: groupData.name,
                        image: groupData.image,
                        // config: undefined  # Revisar como guardar este
                    }

                    if (_group.name === null || _group.name === "") { return; }

                    const createdGroup: Group = await this.groupService.createGroup(_group);
                    const _integrants: IIntegrant[] = [];
                    var arrayIntegrants: Integrant[] = [];

                    // Validar que tenga admins
                    // HAY  QUE VALIDAR ESTE METODO, NO SE GENERARON NINGUN admins
                    if (groupData.admins.length > 0) {

                        for (const admin of groupData.admins) {
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

                    if (groupData.participants.length > 0) {
                        // Vaidar que tenga participants
                        for (const participants of groupData.participants) {
                            const contact: Contact = await this.contactService.findOne(participants);
                            const integra: IIntegrant = {
                                integrant_id: participants,
                                name: contact.name,
                                phone_number: participants.substring(0, 10),
                                type: 'participant',
                            }

                            arrayIntegrants.push(await this.integrantService.createIntegrant(integra));
                        }
                    }

                    if (arrayIntegrants.length > 0) {
                        await this.groupService.updateGroupIntegrants(createdGroup, arrayIntegrants);
                        // integrants = await this.integrantService.createIntegrantsLoad(_integrants);
                    }
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

        //  PRIMERO SE VALIDA QUE EXISTA EL GRUPO O EL CHAT
        const contact: Contact = await this.contactService.findOne(newConversation);

        console.log(contact)
        if (contact) {
            const conversation: Conversation = await this.conversationService.findOne(newConversation);
            
            if (conversation) {
                // crear un mensaje
                if (await this.validateMessageType(response))  { return; }

                const interfaceMessage: IMessage = await this.assignAttributesInMessages(response);
                const newMessage = await this.messageService.createMessage(interfaceMessage);

                
                // Buscar la conversacion en mi contacto
                await this.messageService.saveContactInMessage(newMessage, contact, conversation);
                
            } else {
                // Create conversation
                if (await this.validateMessageType(response))  { return; }

                const conversation: Conversation = new Conversation();
                conversation.id_conversation = newConversation;
                conversation.contacts = [contact];
                
                await this.conversationService.createConversation(conversation);


                const interfaceMessage: IMessage = await this.assignAttributesInMessages(response);
                const newMessage = await this.messageService.createMessage(interfaceMessage);
                
                await this.messageService.saveContactInMessage(newMessage, contact, conversation);
            }

            console.log("El grupo ya existe");
        } else {
            try {
                // SI NO HAY CONTACTO SE CREA UNO NUEVO
                const res: any = await this.Apiconnection(`${response?.phone_id}/contact/${newConversation}`);
                const resInfo: any = res?.data[0];

                const newContact: IContact = {
                    contact_id: resInfo?.id,
                    name: resInfo?.name,
                    type: 'group',
                    phone: phone
                }

                await this.contactService.createContact(newContact);

                // CREAR EL GRUPO
                const groupRes: any = await this.Apiconnection(`${response?.phone_id}/getGroups/${newConversation}`);
                const resGroupInfo: any = groupRes?.data;

                const newGroup: IGroup = {
                    id_group: resInfo?.id,
                    name: resInfo?.name,
                    image: resInfo?.image?.url
                }

                const createdGroup: Group = await this.groupService.createGroup(newGroup);

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

                    for (const participant of resGroupInfo.admins) {
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
                    await this.groupService.updateGroupIntegrants(createdGroup, arrayIntegrants);
                } else {
                    return;
                }
                // AQUI TERMINA LA CREACION DE UN GRUPO

                // OBTENER LA CONVERSACION
                const conversationInfo = await this.Apiconnection(`${response?.phone_id}/getConversations/${newConversation}`);
                const conversationData = conversationInfo?.data;

                const _messages: Message[] = [];
                if (conversationData.messages.length > 0) {
                    for (const message of conversationData.messages) {
                        if (await this.validateMessageType(message)) { continue; }

                        const newMessage: IMessage = await this.messageAttributes(message)
                        _messages.push(await this.messageService.createMessage(newMessage));
                    }
                }


                const Iconversation: IConversation = {
                    id_conversation: newConversation,
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


                console.log("SE CREO CORRECTAMENTE UN NUEVO GRUPO");
            } catch (error) {
                console.log(error);
            }
        }
    }

    // Private methods
    private async validateMessageType(message: any): Promise<boolean> {
        const type: string = message?.message?.type;
        if (type === "info" || type === "ack") { return true; }

        return false;
    }

    // HAY QUE REFACTORIZAR ESTE CODIGO CON EL DE ABAJO, SE HACE SOLO PARA PRUEBAS
    private async assignAttributesInMessages(message: any): Promise<IMessage> {
        const interfaceMessage: IMessage = {
            contact: await this.contactService.findOne(message?.conversation),
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
        const product_id = "c5ae19f1-658c-4f5c-a2a2-1e2c27defe9e";
        const api_token = "5ec7e121-9ecf-4170-a7b3-08337bb9c2e7";
        
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
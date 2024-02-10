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
                const contact3: Contact[] = contacts.slice(0, 5);
                for (const contact of contact3) {
                    const contactInfo: any = await this.Apiconnection(`${id}/contact/${contact.contact_id}`);
                    if (!contactInfo.success || !contactInfo.data) {
                        continue;
                    }
                    const contactData = contactInfo.data[0];
                    const contact_id: string = contactData.id;
                    if (contactData.image.url === "") {
                        continue;
                    }

                    const image: any[] = contactData.image;
                    await this.contactService.loadImage(contact_id, image);
                }
            }
        } catch (error) {
            console.log(error)
        }

    }

    async loadGroupsIntegrants(): Promise<void> {
        // Los grupos son contactos y los cargo de aqui
        const groupIds: string[] = (await this.contactService.getGroupsId());
        // const groupIds2: string[] = groupIds.slice(0, 2)
        const phoneIds: string[] = await this.phoneService.findAllPhoneIds();

        for (const id of phoneIds) {
            for (const contact_id of groupIds) {
                const groupInfo: any = await this.Apiconnection(`${id}/getGroups/${contact_id}`);

                if (!groupInfo.success || groupInfo.data <= 0) {
                    return;
                }
                const groupData: any = groupInfo.data;


                const _group: IGroup = {
                    id_group: contact_id,
                    name: groupData.name,
                    image: groupData.image,
                    // config: undefined  # Revisar como guardar este
                }

                let createdGroup: Group = await this.groupService.createGroup(_group);
                const _integrants: IIntegrant[] = [];
                // Validar que tenga admins
                if (groupData.admins > 0) {
                    for (const admin of groupData.admins) {
                        const contact: Contact = await this.contactService.findOne(admin);
                        _integrants.push({
                            integrant_id: admin,
                            name: contact.name,
                            phone_number: admin.substring(0, 10),
                            type: 'admin'
                        });
                    }
                }

                if (groupData.participants) {
                    // Vaidar que tenga participants
                    for (const participants of groupData.participants) {
                        const contact: Contact = await this.contactService.findOne(participants);
                        _integrants.push({
                            integrant_id: participants,
                            name: contact.name,
                            phone_number: participants.substring(0, 10),
                            type: 'participant'
                        })
                    }
                }

                let integrants: Integrant[];
                if (_integrants.length > 0){
                    integrants = await this.integrantService.createIntegrantsLoad(_integrants);
                    // createdGroup.integrants = integrants;
                    // await this.groupService.saveIntegrantsInGroup(createdGroup);
                }
            }
        }
    }

    async loadGroupConversations(): Promise<void> {
        // Traer los nombres de los grupos
        const phoneIds: string[] = await this.phoneService.findAllPhoneIds();

        const groupIds: string[] = (await this.contactService.getGroupsId()).slice(0, 1);
        for (const id of phoneIds) {
            for (const contact_id of groupIds) {
                const conversationInfo: any = await this.Apiconnection(`${id}/getConversations/${contact_id}`);
                console.log(conversationInfo)

                if (await this.conversationService.existsConversation(contact_id)) {
                    return;
                }
                // Crea conversaciones sin mensajes ni contactos
                const Iconversation: IConversation = { id_conversation: contact_id }
                const conversation: Conversation = await this.conversationService.createConversation(Iconversation);

                if (!conversationInfo.succes || conversationInfo.data <= 0) {
                    return;
                }
                // const conversationData: any = conversationInfo.data;
                // const messages: any = conversationData.messages;

                // await this.messageService.createMessages(messages);
                // Hay que traer las conversaciones de los gruposs
                // que esten activos
                // 
            }
        }
    }

    // Private methods
    private async Apiconnection(endpoint: string): Promise<any> {
        try {
            const url = `${process.env.INSTANCE_URL}/${process.env.PRODUCT_ID}/`
            console.log(`${url}${endpoint}`);
            const response = await rp(`${url}${endpoint}`, {
                method: 'get',
                json: true,
                headers: {
                    'x-maytapi-key': process.env.API_TOKEN
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
import { Inject, Injectable } from "@nestjs/common";
import * as rp from 'request-promise-native';
import { PhoneService } from "src/phone/phone.service";
import { Phone } from "src/phone/phone.entity";
import { parse } from "path";
import { Contact } from "src/contact/contact.entity";
import { ContactService } from "src/contact/contact.service";

@Injectable()
export class WhatsappService {
    constructor(
        private readonly phoneService: PhoneService,
        private readonly contactService: ContactService
    ) {
    }

    // Esta es de prueba solamente
    async findAllPhones(): Promise<Phone[]> {
        return this.phoneService.findAllPhones();
    }

    // Permite cargar la lista de phones a la base de datos
    async loadPhoneList(): Promise<void> {
        const listPhones: any[] = await this.Apiconnection('/listPhones');
        this.phoneService.createPhones(listPhones);
    }

    async loadContacts(): Promise<void> {
        const phoneIds: string[] = await this.phoneService.findAllPhoneIds();

        for (const id of phoneIds) {
            const contactList: any = await this.Apiconnection(`${id}/contacts`);
            if (!contactList.success) {
                return;
            }

            const contacts: any[] = contactList.data;

            const phone: Phone = await this.phoneService.findPhone(parseInt(id)); 
            await this.contactService.createContacts(contacts, phone);
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
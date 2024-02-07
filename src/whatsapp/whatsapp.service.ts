import { Inject, Injectable } from "@nestjs/common";
import * as rp from 'request-promise-native';
import { PhoneService } from "src/phone/phone.service";
import { Phone } from "src/phone/phone.entity";

@Injectable()
export class WhatsappService {
    constructor(
        private readonly phoneService: PhoneService 
    ) {
    }

    async findAllPhones(): Promise<Phone[]>{
        return this.phoneService.findAllPhones();
    }

    async loadPhoneList(): Promise<void>{
        const listPhones: any[] = await this.Apiconnection('/listPhones');
        this.phoneService.createPhones(listPhones);
    }

    // Private methods
    private async Apiconnection(endpoint: string): Promise<any>{
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
            if (response.length < 1)
            {
                throw new Error(response.message)
            }

            return response;
        } catch (error) {
            throw new Error(error)
        }
    }
}
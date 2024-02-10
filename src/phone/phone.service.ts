import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Phone } from './phone.entity'
import { IPhone } from "./phone.interface";

@Injectable()
export class PhoneService {
    constructor(
        @InjectRepository(Phone)
        private phoneRepository: Repository<Phone>
    ) { }

    async findAllPhoneIds(): Promise<string[]> {
        const phones = await this.findAllPhones();
        let phoneIds: string[] = [];

        phones.forEach(phone => {
            phoneIds.push(phone.phone_id.toString());
        });

        return phoneIds;
    }

    async findAllPhones(): Promise<Phone[]> {
        return await this.phoneRepository.find();
    }

    async createPhone(_phone: IPhone): Promise<Phone | undefined> {
        try {
            const phone: Phone = await this.phoneRepository.create({
                phone_id: _phone.phone_id,
                number: _phone.number,
                status: _phone.status,
                type: _phone.type,
                name: _phone.name, 
                data: _phone.data,
                mult_device: _phone.multi_device
            });

            return await this.phoneRepository.save(phone)
        } catch (error) {
            console.log(error)
        }
    }

    async createPhones(_phones: IPhone[]): Promise<void> {
        try {
            for (const phone of _phones) {
                await this.createPhone(phone);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async findPhone(phone_id: number): Promise<Phone> {
        let phone: Phone;
        try {
            phone = await this.phoneRepository.findOne({ where: { phone_id: phone_id } });
        } catch (error) {
            console.log(error)
        }

        return phone;
    }

    async deletePhone(phone_id: number): Promise<Phone> {
        let phone: Phone;
        try {
            phone = await this.phoneRepository.findOne({ where: { phone_id: phone_id } })

            if (!phone) {
                console.log("Telefono no encontrado")
                return;
            }
            await this.phoneRepository.remove(phone);
        } catch (error) {
            console.log(error);
        }

        return phone;
    }
}
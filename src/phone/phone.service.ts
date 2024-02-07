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

    async findAllPhones(): Promise<Phone[]> {
        return await this.phoneRepository.find();
    }

    async createPhone(_phone: IPhone): Promise<void> {
        try {
            const phone = this.phoneRepository.create(
                {
                    phone_id: _phone.phone_id,
                    number: _phone.number,
                    status: _phone.status,
                    type: _phone.type,
                    name: _phone.name,
                    data: _phone.data,
                    mult_device: _phone.multi_device
                }
            )
            await this.phoneRepository.save(phone)
        } catch (error) {
            console.log(error)
        }
    }

    async createPhones(phones: any[]): Promise<void> {
        phones.forEach(phone => {
            const phoneInterface: IPhone = {
                phone_id: phone.id,
                number: phone.number,
                status: phone.status,
                type: phone.type,
                name: phone.name,
                data: JSON.stringify(phone.data),
                multi_device: phone.multi_device
            }

            this.createPhone(phoneInterface);
        });
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
'use strict';

import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Phone } from './phone.entity'
import { CreatePhoneDto, UpdatePhoneDto } from './phone.dto';

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

    async create(phone: CreatePhoneDto): Promise<Phone | undefined> {
        try {
            let record = this.phoneRepository.create(phone);
            await this.phoneRepository.save(record);
            return record;
        } catch (error) {
            throw new HttpException(error.toString(), HttpStatus.CONFLICT);
        }
    }

    /**
     * This function will update the phone information
     * @param id phone identifier
     * @param phone object with the phone body
     * @returns new phone object updated
     */
    async update(id: number, phone: UpdatePhoneDto): Promise<Phone | undefined> {
        try {
            await this.findPhoneById(id);
            phone.updated_at = new Date();
            await this.phoneRepository.update(id, phone);
            return await this.findPhoneById(id);
        } catch (error) {
            throw new HttpException(error.toString(), HttpStatus.CONFLICT);
        }
    }

    async createPhones(_phones: Array<CreatePhoneDto>): Promise<void> {
        try {
            for (const phone of _phones) {
                await this.create(phone);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async findPhone(phone_id: number): Promise<Phone> {
        try {
            let phone: Phone = await this.phoneRepository.findOne({ where: { phone_id: phone_id } });
            if (!phone) {
                throw new HttpException(`The phone with identifier ${phone_id} does not exist`, HttpStatus.NOT_FOUND);
            }
            return phone;
        } catch (error) {
            throw new HttpException(error.toString(), HttpStatus.CONFLICT);
        }
    }

    async findPhoneById(id: number): Promise<Phone> {
        try {
            let phone = await this.phoneRepository.findOne({
                relations: ['licences'],
                where: { id: id }
            });
            if (!phone) {
                throw new HttpException(`The phone with identifier ${id} does not exist`, HttpStatus.NOT_FOUND);
            }
            return phone;
        } catch (error) {
            throw new HttpException(error.toString(), HttpStatus.CONFLICT);
        }
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
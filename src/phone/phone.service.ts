import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Phone } from './phone.entity'

@Injectable()
export class PhoneService {
    constructor(
        @InjectRepository(Phone)
        private phoneRepository: Repository<Phone>
    ) {}

    async findAll(): Promise<Phone[]> {
        return this.phoneRepository.find();
    }
}
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Integrant } from "src/integrant/integrant.entity";
import { ContactService } from "src/contact/contact.service";
import { Contact } from "src/contact/contact.entity";
import { IIntegrant } from "./IIntegrant.interface";

// import { Participant } from "src/participant/participant.entity";

@Injectable()
export class IntegrantService {
    constructor(
        @InjectRepository(Integrant)
        private integrantRepository: Repository<Integrant>,
        private readonly contactService: ContactService,
    ) { }

    async findOne(integrant_id: string): Promise<Integrant> {
        const integrant: Integrant = await this.integrantRepository.findOne({ where: { integrant_id: integrant_id } })
        return integrant;
    }

    async existsIntegrant(integrant_id): Promise<boolean> {
        try {
            const integrant = await this.integrantRepository.findOne({ where: { integrant_id } });
            return integrant ? true : false;
        } catch (error) {
            console.log("no existe el integrante")
        }
    }

    async existsByPhoneNumber(phone_number: string): Promise<boolean> {
        try {
            const integrant = await this.integrantRepository.findOne({ where: { phone_number } })
            return integrant ? true : false;
        } catch (error) {
            console.log(error);
        }
    }

    async createIntegrant(_integrant: IIntegrant): Promise<Integrant | undefined> {
        try {
            const integrant: Integrant = await this.integrantRepository.create({
                integrant_id: _integrant.integrant_id,
                name: _integrant.name,
                phone_number: _integrant.phone_number,
                type: _integrant.type
            });
            if (await this.existsByPhoneNumber(_integrant.phone_number)) {
                return await this.integrantRepository.findOne(
                    {
                        where: { integrant_id: _integrant.integrant_id }
                    }
                )
            }
            return await this.integrantRepository.save(integrant)
        } catch (error) {
            console.log('Error al crear un integrante')
        }
    }

    async createIntegrants(_integrants: IIntegrant[]): Promise<void> {
        try {
            for (const integrant of _integrants) {
                await this.createIntegrant(integrant);
            }
        } catch (error) {
            console.log(error)
        }
    }

    async createIntegrantsLoad(_integrants: IIntegrant[]): Promise<Integrant[]> {
        try {
            const integrants: Integrant[] = [];

            for (const integrant of _integrants) {
                integrants.push(
                    await this.createIntegrant(integrant)
                );
            }
            return integrants;
        } catch (error) {
            console.log(error)
        }
    }
}
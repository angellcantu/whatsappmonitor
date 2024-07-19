'use strict';

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Licences } from './licences.entity';
import { CreateLicenceDto, UpdateLicenceDto } from './licences.dto';
import { ILicenceRepository } from './licences.interface';

@Injectable()
export class LicencesService implements ILicenceRepository {
    
    constructor(
        @InjectRepository(Licences)
        private licenceRepository: Repository<Licences>
    ) { }
    
    findAll(): Promise<Array<Licences>> {
        return this.licenceRepository.find();
    }

    async fetchLicenceById(id: number): Promise<Licences> {
        let licence = await this.licenceRepository.findOne({ where: { id: id } });
        if (!licence) {
            throw new HttpException(`Licence with identifier ${id} does not exist`, HttpStatus.NOT_FOUND);
        }
        return licence;
    }


    async create(licence: CreateLicenceDto): Promise<Licences> {
        try {
            let record = this.licenceRepository.create(licence);
            await this.licenceRepository.save(record);
            return record
        } catch (error) {
            throw new HttpException(error.toString(), HttpStatus.CONFLICT);
        }
    }

    async update(id: number, licence: UpdateLicenceDto): Promise<Licences> {
        try {
            await this.fetchLicenceById(id);
            licence.updated_at = new Date();
            await this.licenceRepository.update(id, licence);
            return await this.fetchLicenceById(id);
        } catch (error) {
            throw new HttpException(error.toString(), HttpStatus.CONFLICT);
        }
    }

}
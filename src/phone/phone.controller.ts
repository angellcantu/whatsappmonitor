'use strict';

import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { PhoneService } from "./phone.service";
import { LicencesService } from '../licences/licences.service';
import { CreatePhoneDto } from './phone.dto';

@Controller('phones')
export class PhoneController {
    
    constructor(
        private readonly phoneService: PhoneService,
        private readonly licencesService: LicencesService
    ) { }

    @Get()
    async AllGroups() {
        const phones = await this.phoneService.findAllPhones();
        if (!phones.length) {
            return [];
        }
        return phones;
    }

    @Get(':id')
    findPhoneById(@Param('id') id: number) {
        return this.phoneService.findPhoneById(id);
    }

    @Post()
    async create(@Body() phone: CreatePhoneDto) {
        let licences = await this.licencesService.fetchLicenceById(phone.licence_id);
        phone.licences = licences;
        return this.phoneService.create(phone);
    }

}
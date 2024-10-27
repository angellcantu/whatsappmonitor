'use strict';

import { Controller, Get, Post, Body, Param, Put } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExcludeController } from '@nestjs/swagger';
import { PhoneService } from "./phone.service";
import { LicencesService } from '../licences/licences.service';
import { CreatePhoneDto, UpdatePhoneDto } from './phone.dto';

@Controller('phones')
@ApiTags('Phones')
@ApiExcludeController()
export class PhoneController {
    
    constructor(
        private readonly phoneService: PhoneService,
        private readonly licencesService: LicencesService
    ) { }

    @Get()
    @ApiOperation({ deprecated: true })
    async AllGroups() {
        const phones = await this.phoneService.findAllPhones();
        if (!phones.length) {
            return [];
        }
        return phones;
    }

    @Get(':id')
    @ApiOperation({ deprecated: true })
    findPhoneById(@Param('id') id: number) {
        return this.phoneService.findPhoneById(id);
    }

    @Post()
    @ApiOperation({ deprecated: true })
    async create(@Body() phone: CreatePhoneDto) {
        let licences = await this.licencesService.fetchLicenceById(phone.licence_id);
        phone.licences = licences;
        return this.phoneService.create(phone);
    }

    @Put(':id')
    @ApiOperation({ deprecated: true })
    async update(@Param('id') id: number, @Body() phone: UpdatePhoneDto) {
        let licences = await this.licencesService.fetchLicenceById(phone.licence_id);
        delete phone.licence_id;
        phone.licences = licences;
        return this.phoneService.update(id, phone);
    }

}
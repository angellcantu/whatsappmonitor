'use strict';

import { Controller, Get, Param, Body, Post, Put } from '@nestjs/common';
import { LicencesService } from './licences.service';
import { CreateLicenceDto, UpdateLicenceDto } from './licences.dto';

@Controller('licences')
export class LicencesController {

    constructor(private readonly licencesService: LicencesService) { }

    @Get()
    findAll() {
        return this.licencesService.findAll();
    }

    @Get(':id')
    fetchLicenceById(@Param('id') id: number) {
        return this.licencesService.fetchLicenceById(id);
    }

    @Post()
    create(@Body() licence: CreateLicenceDto) {
        return this.licencesService.create(licence);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() licence: UpdateLicenceDto) {
        return this.licencesService.update(id, licence);
    }


}
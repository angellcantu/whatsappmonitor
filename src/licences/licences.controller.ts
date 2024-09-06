'use strict';

import { Controller, Get, Param, Body, Post, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { LicencesService } from './licences.service';
import { CreateLicenceDto, UpdateLicenceDto } from './licences.dto';
import { IAuthUser } from '../auth/auth.interface';

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
    async create(@Body() licence: CreateLicenceDto, @Res() response: Response) {
        let user: IAuthUser = response.locals.auth;
        licence.user_id = user.id;
        return response.json(await this.licencesService.create(licence));
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() licence: UpdateLicenceDto, @Res() response: Response) {
        let user: IAuthUser = response.locals.auth;
        licence.user_id = user.id;
        return response.json(await this.licencesService.update(id, licence));
    }


}
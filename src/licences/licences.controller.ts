'use strict';

import { Controller, Get, Param, Body, Post, Put, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { LicencesService } from './licences.service';
import { CreateLicenceDto, UpdateLicenceDto } from './licences.dto';
import { IAuthUser } from '../auth/auth.interface';

@Controller('licences')
@ApiTags('Licences')
@ApiExcludeController()
export class LicencesController {

    constructor(private readonly licencesService: LicencesService) { }

    @Get()
    @ApiOperation({ deprecated: true })
    findAll() {
        return this.licencesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ deprecated: true })
    fetchLicenceById(@Param('id') id: number) {
        return this.licencesService.fetchLicenceById(id);
    }

    @Post()
    @ApiOperation({ deprecated: true })
    async create(@Body() licence: CreateLicenceDto, @Res() response: Response) {
        let user: IAuthUser = response.locals.auth;
        licence.user_id = user.id;
        return response.json(await this.licencesService.create(licence));
    }

    @Put(':id')
    @ApiOperation({ deprecated: true })
    async update(@Param('id') id: number, @Body() licence: UpdateLicenceDto, @Res() response: Response) {
        let user: IAuthUser = response.locals.auth;
        licence.user_id = user.id;
        return response.json(await this.licencesService.update(id, licence));
    }


}
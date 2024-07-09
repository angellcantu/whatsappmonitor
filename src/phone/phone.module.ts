'use strict';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneController } from './phone.controller';
import { Phone } from './phone.entity';
import { Licences } from '../licences/licences.entity';
import { PhoneService } from './phone.service';
import { LicencesService } from '../licences/licences.service';

@Module({
    imports: [TypeOrmModule.forFeature([Phone, Licences])],
    controllers: [PhoneController],
    providers: [PhoneService, LicencesService],
    exports: [PhoneService]
})
export class PhoneModule { }
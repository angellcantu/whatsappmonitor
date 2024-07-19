'use strict';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Licences } from './licences.entity';
import { LicencesController } from './licences.controller';
import { LicencesService } from './licences.service';

@Module({
    imports: [TypeOrmModule.forFeature([Licences])],
    controllers: [LicencesController],
    providers: [LicencesService],
    exports: [LicencesService]
})
export class LicencesModule { }
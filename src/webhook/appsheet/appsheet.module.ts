'use strict';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Surveys } from './appsheet.entity';
import { AppSheetController } from './appsheet.controller';
import { AppSheetService } from './appsheet.service';
import { FtpService } from '../../whatsapp/ftp.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Surveys]),
        HttpModule
    ],
    controllers: [AppSheetController],
    providers: [
        AppSheetService,
        FtpService
    ],
    exports: [AppSheetService]
})
export class AppSheetModules {}
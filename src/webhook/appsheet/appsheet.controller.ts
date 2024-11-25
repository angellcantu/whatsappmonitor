'use strict';

import { Controller, Post, Body } from '@nestjs/common';
import { AppSheetService } from './appsheet.service';
import { AppSheetDto } from './appsheet.dto';

@Controller('appsheet')
export class AppSheetController {

    constructor(private readonly appSheet: AppSheetService) {}

    @Post()
    createSurvey(@Body() survey: AppSheetDto) {
        return this.appSheet.create(survey);
    }

}
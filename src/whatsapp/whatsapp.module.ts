'use strict';

import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { PhoneService } from 'src/phone/phone.service';
import { ContactService } from 'src/contact/contact.service';
import { MaytApiService } from './maytapi.service';

@Module({
    imports: [
        PhoneService,
        ContactService
    ],
    controllers: [],
    providers: [
        WhatsappService,
        PhoneService,
        ContactService,
        MaytApiService
    ]
})
export class WhatsappModule { }
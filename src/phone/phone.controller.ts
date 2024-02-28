import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { PhoneService } from "./phone.service";

@Controller('phone')
export class PhoneController {
    constructor(
        private readonly phoneService: PhoneService
    ) { }

    @Get('phones')
    async AllGroups() {
        const phones = await this.phoneService.findAllPhones();
        console.log(phones)
        if (phones.length > 0) {
            return phones;
        } else {
            return [];
        }
    }
}
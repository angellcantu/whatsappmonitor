import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ApiExcludeController } from '@nestjs/swagger';
import { ContactService } from "./contact.service";

@Controller('contact')
@ApiExcludeController()
export class ContactController {
    constructor(
        private readonly contactService: ContactService
    ) { }

    @Get('contacts')
    async AllContacts() {
        const contacts = await this.contactService.findAll();
        console.log(contacts)
        if (contacts.length > 0) {
            return contacts;
        } else {
            return [];
        }
    }
}
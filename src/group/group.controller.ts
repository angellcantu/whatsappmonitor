import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { GroupService } from "./group.service";
import { WhatsappService } from "src/whatsapp/whatsapp.service";

@Controller('group')
export class GroupController {
    constructor(
        private readonly groupService: GroupService,
        private readonly whatsappService: WhatsappService
    ) { }

    @Get('groups')
    async AllGroups() {
        const groups = await this.groupService.findAllGroups();
        console.log(groups)
        if (groups.length > 0) {
            return groups;
        } else {
            return [];
        }
    }

    @Get('allGroups')
    async AllGroupWithIntegrants() {
        const groups = await this.groupService.findGroupsWithIntegrants();
        if (groups.length > 0) {
            return groups;
        } else {
            return [];
        }
    }

    @Get('municipios')
    async AllMunicipios() {
        const municipios = await this.groupService.findMunicipios();
        if (municipios.length > 0) {
            return municipios;
        } else {
            return [];
        }
    }

    @Get(':groupId/messages')
    async GroupMessages(@Param('groupId') groupId: string) {
        console.log(groupId);
        const messages = await this.groupService.getGroupMessages(groupId);
        console.log(messages);
        if (messages.length > 0) {
            return messages;
        } else {
            return [];
        }
    }

    @Get('actualizarGrupos')
    async ActualizarGrupos() {
        try {
            await this.whatsappService.loadPhoneList();
            await this.whatsappService.loadContacts();
            await this.whatsappService.loadImagesInContacts();
            await this.whatsappService.loadImagesInGroups();
            await this.whatsappService.loadGroupsIntegrants();
            await this.whatsappService.loadGroupConversations();
        } catch (error) {
            console.log(error);
        }

    }
    
   

    }

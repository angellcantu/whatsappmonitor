import { Controller, Get, Post, Body, Param, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { GroupService } from "./group.service";
import { WhatsappService } from "src/whatsapp/whatsapp.service";
import { CreateGroupDto, AddIntegrantDto } from './group.dto';

@Controller('group')
@ApiTags('Groups')
@ApiBearerAuth()
export class GroupController {
    
    constructor(
        private readonly groupService: GroupService,
        private readonly whatsappService: WhatsappService
    ) { }

    @Get('groups')
    @ApiOperation({ deprecated: true })
    @ApiExcludeEndpoint()
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
    @ApiOperation({ deprecated: true })
    @ApiExcludeEndpoint()
    async AllGroupWithIntegrants() {
        const groups = await this.groupService.findGroupsWithIntegrants();
        if (groups.length > 0) {
            return groups;
        } else {
            return [];
        }
    }

    @Get('municipios')
    @ApiOperation({ deprecated: true })
    @ApiExcludeEndpoint()
    async AllMunicipios() {
        const municipios = await this.groupService.findMunicipios();
        if (municipios.length > 0) {
            return municipios;
        } else {
            return [];
        }
    }

    @Get(':groupId/messages')
    @ApiOperation({ deprecated: true })
    @ApiExcludeEndpoint()
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
    @ApiOperation({ deprecated: true })
    @ApiExcludeEndpoint()
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

    @Post()
    @ApiOperation({ description: 'This service will create a new group in the provider and the database.' })
    create(@Body() group: CreateGroupDto) {
        return this.groupService.create(group);
    }

    @Get('/:id')
    @ApiOperation({ description: 'This service will get the group information.' })
    getGroupInformation(@Param('id', ParseIntPipe) id: number) {
        return this.groupService.getGroupInformation(id);
    }

    @Post('/integrant')
    @ApiOperation({ description: 'This service will add a new integrant in the group' })
    addIntegrant(@Body() body: AddIntegrantDto) {
        return this.groupService.addIntegrant(body);
    }

}

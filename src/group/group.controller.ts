import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { GroupService } from "./group.service";

@Controller('group')
export class GroupController {
    constructor(
        private readonly groupService: GroupService
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
}
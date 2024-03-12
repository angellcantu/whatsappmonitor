import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Group } from './group.entity'
import { IGroup } from "./group.interface";
import { IntegrantService } from "src/integrant/integrant.service";
import { GroupQueries } from "./group.queries";
import { Message } from "src/message/message.entity";
import { MessageService } from "src/message/message.service";
import { IIntegrant } from "src/integrant/IIntegrant.interface";
import { Integrant } from "src/integrant/integrant.entity";

@Injectable()
export class GroupService {
    constructor(
        @InjectRepository(Group)
        private groupRepository: Repository<Group>,
        private readonly integrantService: IntegrantService,
        private readonly messageService: MessageService
    ) { }

    async findAllGroups(): Promise<Group[] | undefined> {
        try {
            return await this.groupRepository.find();
        } catch (error) {
            // Revisar que retornar
            return error;
        }
    }

    async findGroupsWithIntegrants() {
        try {
            const rawQuery = `
                SELECT g.id, g.id_group, g.name, g.image, g.config, 
                       g.id_municipio, g.createdAt, g.updatedAt, g.status,
	                   MAX(m.createdAt) AS last_message_date,
                       COUNT(DISTINCT integrant_id) AS integrants
	            FROM [ycrwrusj_botwats].[group] as g
	                LEFT JOIN group_integrant gi ON gi.group_id = g.id
	                LEFT JOIN integrant i ON i.id = gi.integrant_id
	                LEFT JOIN conversation c ON c.id_conversation = g.id_group
	                LEFT JOIN message m ON m.conversationId = c.id
	                GROUP BY 
                        g.id, g.id_group, g.name, g.image, 
                        g.config, 
                        g.id_municipio,
                        g.createdAt, 
                        g.updatedAt, 
                        g.status;`;

            const result: Group[] = await this.groupRepository.query(rawQuery);
            return result.map(result => {
                const group = new Group();
                group.id = result.id,
                group.id_group = result.id_group,
                group.name = result.name,
                group.image = result.image,
                group.config = null,
                group.id_municipio = result.id_municipio,
                group.createdAt = result.createdAt,
                group.status = result.status,
                group.last_message_date = result.last_message_date,
                group.integrants = result.integrants
                return group;
            });
        } catch (erorr) {

        }
    }

    async getGroupMessages(id_group: string): Promise<Message[]> {
        try {
            const messages: Message[] = await this.messageService.getMessageByGroup(id_group);

            return messages;
        } catch (error) {
            console.log(error);
        }
    }
    async findGroup(group_id: string): Promise <Group | undefined> {
        try {
            return await this.groupRepository.findOne({where: {id_group: group_id}});
        } catch (error) {
            console.log(error);
        }
    }

    async createGroup(_group: IGroup): Promise<Group | undefined> {
        try {
            const group: Group = await this.groupRepository.create({
                id_group: _group.id_group,
                name: _group.name,
                image: _group.image,
                config: null // Revisar este
            });
            return await this.groupRepository.save(group)
            // return { success: true, message: 'Chat creado exitosamente' };
        } catch (error) {
            // return { success: false, message: 'Error interno al crear el chat' };
            console.log(error);
        }
    }

    async findOneGroup(group_id: number): Promise<Group | undefined> {
        try {
            const group: Group = await this.groupRepository.findOne({ where: { id: group_id } })
            if (!group) {
                throw new NotFoundException('Grupo no encontrado');
                return;
            }
            return group;
        } catch (error) {
            console.log("Error interno al buscar el chat");
        }
    }

    async createLoadGroup(_group: any): Promise<void> {
        const queryRunner = this.groupRepository.manager.connection.createQueryRunner();

        try {

            if (await this.existsGroup(_group.name)) {
                console.log("Ya existe el grupo")
                return;
            }

            const participants: string[] = _group.participants;
            const admins: string[] = _group.admins;

            const group: Group = await this.groupRepository.create({
                name: _group.name,
                // config: _group.config,
                image: _group.image,
                // integrants: integrants
            });
            const createdGroup: Group = await this.groupRepository.save(group);

            // await this.integrantService.createIntegrants(
            //     admins, participants, createdGroup.id
            // );

        } catch (error) {
            console.log(error)
        }
    }
    async saveIntegrantsInGroup(group: Group): Promise<void> {
        try {
            console.log('Sigue siendo el id: ', group.id);
            await this.groupRepository.save(group)
        } catch (error) {
            console.log(error);
        }

    }

    async existsGroup(groupName: string): Promise<boolean> {
        try {
            const group = await this.groupRepository.findOne({ where: { name: groupName } });
            console.log(group)
            return group ? true : false;
        } catch (error) {
            console.log("no existe el integrante")
        }
    }

    async updateGroupIntegrants(_group: Group, integrants: Integrant[]): Promise<void> {
        try {
            const group = await this.groupRepository.findOne(
                { where: { id: _group.id }, relations: ['integrants'] }
            );

            if (!group) {
                console.log("Grupo no existe")
            }

            group.integrants = integrants;
            await this.groupRepository.save(group);

        } catch (error) {
            console.log(error)
        }
    }

    async findOrCreate(group: IGroup): Promise<Group | undefined> {
        try {
            if (await this.existsGroup(group.name)) {
                return await this.groupRepository.findOne({ where: { name: group.name } });
            } else {
                const newGroup: Group = await this.createGroup(group);
                return newGroup;
            }
        } catch (error) {

        }
    }

    async loadImage(group_id: string, image: string): Promise<void> {
        try {
            const group: Group = await this.groupRepository.findOne({ where: { id_group: group_id } });
            group.image = image;
            await this.groupRepository.update(group.id, { image });
        } catch (error) {
            console.log(error);
        }
    }
}
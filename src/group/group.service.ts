import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Group } from './group.entity'
import { IGroup } from "./group.interface";

@Injectable()
export class GroupService {
    constructor(
        @InjectRepository(Group)
        private groupRepository: Repository<Group>
    ) { }

    async createGroup(group: IGroup): Promise<void> {
        try {
            await this.groupRepository.save(group)
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

    async loadImagesInGroup(): Promise<void> {
        
    }
}
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Group } from './group.entity'

@Injectable()
export class GroupService {
    constructor(
        @InjectRepository(Group)
        private groupRepository: Repository<Group>
    ) {}

    async findAll(): Promise<Group[]> {
        return this.groupRepository.find();
    }
}
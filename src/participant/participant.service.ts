import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Participant } from './participant.entity'

@Injectable()
export class ParticipantService {
    constructor(
        @InjectRepository(Participant)
        private participantRepository: Repository<Participant>
    ) {}

    async findAll(): Promise<Participant[]> {
        return this.participantRepository.find();
    }
}
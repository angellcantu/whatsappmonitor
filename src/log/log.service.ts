import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Log } from "./log.entity"
import { ILog } from "./log.interface"; 

@Injectable()
export class LogService {
    constructor(
        @InjectRepository(Log)
        private logRepository: Repository<Log>
    ) { }

    async findAll(): Promise<Log[]> {
        return await this.logRepository.find();
    }

    async createLog(_log: ILog): Promise<Log | undefined> {
        try {
            const conversation: Log = await this.logRepository.create({
                event: _log.event,
                message: _log.message 
            })
            return await this.logRepository.save(conversation);
        } catch (error) {
            console.log(error)
        }
    }
}
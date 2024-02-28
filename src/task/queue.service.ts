import { Injectable, Module } from "@nestjs/common";
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class QueueService {
    constructor(@InjectQueue('whatsapp') private readonly whatsappQueue: Queue) { }

    async addToQueue(method: string, data: any) {
        await this.whatsappQueue.add(method, data);
    }
}
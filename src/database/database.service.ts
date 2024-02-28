import { Inject, Injectable } from "@nestjs/common";
import { WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventsGateway } from "src/events/events.gateway";

@Injectable()
export class DatabaseService {
    private readonly eventsGateway: EventsGateway

    async insertMessageData(data: any): Promise<void> {
        console.log('NUEVO MENSAJE A LA BASE DE DATOS');
        this.eventsGateway.handleDataInsertion(data);
    }
}
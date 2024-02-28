import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "http";

@WebSocketGateway()
export class EventsGateway {
    @WebSocketServer() server: Server;

    handleDataInsertion(data: any) {
        this.server.emit('dataInserted', data);
    }
}
import { Inject, Injectable } from "@nestjs/common";
import { ConnectionPool } from 'mssql';
import { IGroup } from 'src/group/group.interface';
import * as rp from 'request-promise-native';
import { IMessage } from "src/message/message.interface";
import { IParticipant } from "src/participant/participant.interface";
import { ignoreElements } from "rxjs";

@Injectable()
export class WhatsappService {
    private groups: IGroup[] = [];

    constructor(
        // @Inject('mssql') private readonly mssql: ConnectionPool
    ) {
        this.getGroupsCall();
    }

    private async getGroupsCall(): Promise<void> {
        try {
            const url = `${process.env.PRODUCT_ID}/${process.env.PHONE_ID}/getGroups`;
            const response = await rp('https://jsonplaceholder.typicode.com/posts', {
                method: 'get',
                json: true,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
            });
            //   if (response.status != 200)
            //     throw new Error('Solicitud de API no fue exitosa');
            const groupNames: IGroup[] = [];
            // let groupNames: string[];

            const message: IMessage = {
                id: 1,
                content: "Hello",
                participant_id: 1,
                provider_id: "1",
                message_type: "text",
                url: "aaaa.com"
            };

            const participant: IParticipant = {
                id: 1,
                name: 'Carlos', 
                phone_number: '5626499503',
                role: 'participant',
            }

            response.forEach(element => {
                const grupo: IGroup = {
                    id: element.id,
                    name: element.title,
                    participants: [
                        participant,
                        participant
                    ],
                    messages: []
                }
                groupNames.push(grupo);
            });

            this.groups = groupNames;
        } catch (error) {
            console.error('Error al obtener datos desde la API:', error.message);
            throw error;
        }
    }

    async getGroupNames(): Promise<string[]> {
        try {
            const groupNames: string[] = this.groups.map((grupo) => grupo.name);
            return groupNames;
        } catch (error) {
            console.log(error)
        }
    }

    async getParticipantsByGroup(): Promise<void>{
        try {
            this.groups.forEach((grupo) => {
                console.log(grupo.participants)
            });
            // return IParticipant[];
        } catch(error){

        }
    }
}
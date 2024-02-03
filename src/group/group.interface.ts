import { Message } from "src/message/message.entity";
import { IParticipant } from "src/participant/participant.interface";

export interface IGroup {
    id: string;
    name: string;
    participants: IParticipant[];
    messages: Message[]
    [config: string]: any
  }
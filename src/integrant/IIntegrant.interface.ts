import { Group } from "src/group/group.entity";

export interface IIntegrant {
    name?: string;
    integrant_id: string;
    phone_number?: string;
    type: string;
    groups?: Group[];
}
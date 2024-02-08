import { Phone } from "src/phone/phone.entity";

export interface IContact {
    contact_id: string;
    name?: string;
    type: string;
    [images: string]: any;
    phone: Phone;
}
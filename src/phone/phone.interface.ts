import { Contact } from "src/contact/contact.entity";

export interface IPhone {
    phone_id: number;
    number: string;
    status: string;
    type: string;
    name?: string;
    [data: string]: any;
    multi_device: boolean;
    contacts?: Contact[];
  }
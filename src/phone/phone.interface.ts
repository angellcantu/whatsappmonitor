'use strict';

import { Contact } from "src/contact/contact.entity";
import { Licences } from '../licences/licences.entity';

export interface IPhone {
    phone_id: number;
    number: string;
    status: string;
    type: string;
    name?: string;
    [data: string]: any;
    multi_device: boolean;
    contacts?: Contact[];
    licences: Licences
  }
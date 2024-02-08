import { IContact } from "src/contact/contact.interface";
import { Integrant } from "src/integrant/integrant.entity";

export interface IGroup extends IContact {
    integrants?: Integrant[];
    [config: string]: any
  }
import { IContact } from "src/contact/contact.interface";
import { Integrant } from "src/integrant/integrant.entity";

export interface IGroup {
	id_group: string;
	name?: string;
	image?: string;
	[config: string]: any
	integrants?: Integrant[];
}
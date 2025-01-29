import { Injectable, NotFoundException, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Group } from './group.entity'
import { IGroup } from "./group.interface";
import { Message } from "src/message/message.entity";
import { MessageService } from "src/message/message.service";
import { ContactService } from 'src/contact/contact.service';
import { IntegrantService } from 'src/integrant/integrant.service';
import { Integrant } from "src/integrant/integrant.entity";
import { IMunicipio } from "src/municipio/municipio.interface";
import { CreateGroupDto, AddIntegrantDto } from './group.dto';
import { MaytApiService } from '../whatsapp/maytapi.service';
import { Contact } from "src/contact/contact.entity";

@Injectable()
export class GroupService {

    constructor(
        @InjectRepository(Group)
        private groupRepository: Repository<Group>,
        private readonly messageService: MessageService,
        private readonly maytApiService: MaytApiService,
        private readonly contact: ContactService,
        private readonly integrant: IntegrantService
    ) { }

    async findAllGroups(): Promise<Group[] | undefined> {
        try {
            return await this.groupRepository.find();
        } catch (error) {
            // Revisar que retornar
            return error;
        }
    }

    async findGroupsWithIntegrants() {
        try {
            const rawQuery = `
                SELECT g.id, g.id_group, g.name, g.image, g.config, 
                       g.id_municipio,
                       g.createdAt, g.updatedAt, g.status,
	                   MAX(m.createdAt) AS last_message_date,
                       COUNT(DISTINCT integrant_id) AS integrants
	            FROM [ycrwrusj_botwats].[group] as g
	                LEFT JOIN group_integrant gi ON gi.group_id = g.id
	                LEFT JOIN integrant i ON i.id = gi.integrant_id
	                LEFT JOIN conversation c ON c.id_conversation = g.id_group
	                LEFT JOIN message m ON m.conversationId = c.id
                    LEFT JOIN municipio mn ON mn.id = g.id_municipio
	                GROUP BY 
                        g.id, g.id_group, g.name, g.image, 
                        g.config, 
                        g.id_municipio,
                        g.createdAt, 
                        g.updatedAt, 
                        g.status;`;

            // const groups: Group[] = await this.groupRepository.find({ relations: ['integrants'] });

            const result: Group[] = await this.groupRepository.query(rawQuery);
            return result.map(result => {
                const group = new Group();
                group.id = result.id,
                    group.id_group = result.id_group,
                    group.name = result.name,
                    group.image = result.image,
                    group.config = null,
                    group.id_municipio = result.id_municipio === null ? 0 : result.id_municipio,
                    group.createdAt = result.createdAt,
                    group.status = result.status,
                    group.last_message_date = result.last_message_date,
                    group.integrants = result.integrants
                return group;
            });
        } catch (erorr) {

        }
    }

    async findMunicipios() {
        try {
            const rawQuery = `
                SELECT id, name FROM municipio
            `;
            const result: IMunicipio[] = await this.groupRepository.query(rawQuery);
            return result.map(result => {
                const municipio: IMunicipio = {
                    id: result.id,
                    name: result.name
                }
                return municipio;
            });
        } catch (error) {

        }
    }

    async getGroupMessages(id_group: string): Promise<Message[]> {
        try {
            const messages: Message[] = await this.messageService.getMessageByGroup(id_group);

            return messages;
        } catch (error) {
            console.log(error);
        }
    }
    async findGroup(group_id: string): Promise<Group | undefined> {
        try {
            return await this.groupRepository.findOne({ where: { id_group: group_id } });
        } catch (error) {
            console.log(error);
        }
    }

    async createGroup(_group: IGroup): Promise<Group | undefined> {
        try {
            const group: Group = await this.groupRepository.create({
                id_group: _group.id_group,
                name: _group.name,
                image: _group.image,
                config: null // Revisar este
            });
            return await this.groupRepository.save(group)
            // return { success: true, message: 'Chat creado exitosamente' };
        } catch (error) {
            // return { success: false, message: 'Error interno al crear el chat' };
            console.log(error);
        }
    }

    async findOneGroup(group_id: number): Promise<Group | undefined> {
        try {
            const group: Group = await this.groupRepository.findOne({ where: { id: group_id } })
            if (!group) {
                throw new NotFoundException('Grupo no encontrado');
                return;
            }
            return group;
        } catch (error) {
            console.log("Error interno al buscar el chat");
        }
    }

    async createLoadGroup(_group: any): Promise<void> {
        const queryRunner = this.groupRepository.manager.connection.createQueryRunner();

        try {

            if (await this.existsGroup(_group.name)) {
                console.log("Ya existe el grupo")
                return;
            }

            const participants: string[] = _group.participants;
            const admins: string[] = _group.admins;

            const group: Group = await this.groupRepository.create({
                name: _group.name,
                // config: _group.config,
                image: _group.image,
                // integrants: integrants
            });
            const createdGroup: Group = await this.groupRepository.save(group);

            // await this.integrantService.createIntegrants(
            //     admins, participants, createdGroup.id
            // );

        } catch (error) {
            console.log(error)
        }
    }

    async saveIntegrantsInGroup(group: Group): Promise<void> {
        try {
            console.log('Sigue siendo el id: ', group.id);
            await this.groupRepository.save(group)
        } catch (error) {
            console.log(error);
        }

    }

    async existsGroup(groupName: string): Promise<boolean> {
        try {
            const group = await this.groupRepository.findOne({ where: { name: groupName } });
            console.log(group)
            return group ? true : false;
        } catch (error) {
            console.log("no existe el integrante")
        }
    }

    async updateGroupIntegrants(_group: Group, integrants: Integrant[]): Promise<void> {
        try {
            const group = await this.groupRepository.findOne(
                { where: { id: _group.id }, relations: ['integrants'] }
            );

            if (!group) {
                console.log("Grupo no existe")
            }

            group.integrants = integrants;
            await this.groupRepository.save(group);

        } catch (error) {
            console.log(error)
        }
    }

    async findOrCreate(group: IGroup): Promise<Group | undefined> {
        try {
            if (await this.existsGroup(group.name)) {
                return await this.groupRepository.findOne({ where: { name: group.name } });
            } else {
                const newGroup: Group = await this.createGroup(group);
                return newGroup;
            }
        } catch (error) {

        }
    }

    async loadImage(id: number, image: string): Promise<void> {
        try {
            await this.groupRepository.update(id, { image: image, updatedAt: new Date() });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * This function will create a new group in the provider and database.
     * @param group group object with the necessary information
     * @returns new object with the group information
     */
    async create(group: CreateGroupDto): Promise<Group> {
        try {
            let newIntegrants: Array<Integrant> = [];

            // validate if the group name already exist
            let record: Group = await this.groupRepository.findOne({ where: { name: group?.name } });

            if (record) {
                throw new HttpException(`This group with the name ${record.name} alredy exist.`, HttpStatus.CONFLICT);
            }

            let integrants: Array<string> = group.integrants.map(integrant => `521${integrant}`);
            let maytApi = await this.maytApiService.createGroup({ name: group.name, integrants: integrants });

            if (!maytApi?.success) {
                throw new HttpException('Error creating the group with the provider', HttpStatus.CONFLICT);
            }

            // creating the group
            let _group: Group = this.groupRepository.create({
                id_group: maytApi?.data?.id,
                name: group.name,
                image: group?.image
            });
            await this.groupRepository.save(_group);

            // getting the contact information
            if (maytApi?.data?.participants.length) {
                maytApi?.data?.participants.map(async (item: string) => {
                    let contact: Contact = await this.contact.findOne(item);
                    if (!contact) {
                        let contactMaytApi = await this.maytApiService.getContactInformation(item);

                        if (contactMaytApi?.success && contactMaytApi?.data?.length) {
                            let [_contact] = contactMaytApi?.data;
                            contact = await this.contact.createContact({
                                contact_id: _contact.id,
                                name: _contact.name,
                                type: _contact.type,
                                images: null
                            });
                        }
                    }

                    let integrant: Integrant = await this.integrant.findOne(item);
                    if (!integrant) {
                        let integrantMaytApi = await this.maytApiService.getContactInformation(item);

                        if (integrantMaytApi?.success && integrantMaytApi?.data?.length) {
                            let [_integrant] = integrantMaytApi?.data;
                            let [number] = _integrant?.id.split('@');
                            let [_, firstNumbers] = number.split('521');
                            integrant = await this.integrant.createIntegrant({
                                name: _integrant.name,
                                integrant_id: _integrant.id,
                                phone_number: firstNumbers,
                                type: 'participant',
                                groups: [_group]
                            });
                        }
                    }
                    newIntegrants.push(integrant);
                    return item;
                });
                await this.updateGroupIntegrants(_group, newIntegrants);
            }
            return await this.getGroupInformation(_group?.id);
        } catch (error) {
            throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * This function will return the group information.
     * @param id group identifier, this must be a identifier value
     * @returns group object information
     */
    async getGroupInformation(id: number) {
        try {
            let group = await this.groupRepository.findOne({
                where: { id: id },
                relations: {
                    integrants: true
                }
            });
            if (!group) {
                throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
            }
            const _group = await this.maytApiService.getGroupInformation(group.id_group);
            if (_group.success && _group?.data?.participants.length) {
                await Promise.allSettled(_group?.data?.participants.map(async (item: string) => {
                    const information = await this.maytApiService.getContactInformation(item);
                    if (information?.success && information?.data?.length) {
                        const [integrant] = information?.data;
                        const phone = item.split('521')[1].split('@c.us')[0];
                        const newIntegrant: Integrant = await this.integrant.createIntegrant({
                            name: integrant?.name,
                            integrant_id: integrant?.id,
                            phone_number: phone,
                            type: 'participant',
                            groups: [group]
                        });
                        return newIntegrant;
                    }
                }))
                    .then(response => {
                        const integrants: Array<Integrant> = [];
                        response.forEach(item => {
                            if (item.status === 'fulfilled') {
                                integrants.push(item.value);
                            }
                        });
                        return integrants;
                    })
                    .then(async (response) => await this.updateGroupIntegrants(group, response))
                    .catch(error => console.error(error));
            }
            return await this.groupRepository.findOne({
                where: { id },
                relations: {
                    integrants: true,
                },
            });
        } catch (error) {
            throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * This function will add a new integrant in a specific group.
     * @param body group object with the necessary information
     * @returns new object
     */
    async addIntegrant(body: AddIntegrantDto) {
        try {
            let group = await this.getGroupInformation(body?.id);
            let integrants = body?.integrants?.map(integrant => `521${integrant}`);
            integrants = await Promise.all(integrants?.map(item => {
                let [integrant] = group?.integrants?.filter(inte => {
                    let [phone] = inte?.id_integrant.split('@c.us');
                    if (phone === item) {
                        return item;
                    }
                });
                if (!integrant) {
                    return item;
                }
            }))
                .then(response => response.filter(item => typeof item === 'string'));

            let addMaytApi = await this.maytApiService.addIntegrant({
                groupId: group?.id_group,
                integrants: integrants,
                message: `Bienvenido al grupo: ${group?.name}!!`,
            });

            if (addMaytApi.success) {
                return this.getGroupInformation(group?.id);
            }
        } catch (error) {
            throw new HttpException(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findIntegrantInGroup(groupId: string) {
        return await this.groupRepository.findOne({
            where: { id_group: groupId },
            relations: {
                integrants: true,
            },
        });
    }

}
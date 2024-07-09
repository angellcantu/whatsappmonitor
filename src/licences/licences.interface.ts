'use strict';

import { Licences } from './licences.entity';
import { CreateLicenceDto, UpdateLicenceDto } from './licences.dto';

export interface ILicenceRepository {

    findAll(): Promise<Array<Licences>>;

    fetchLicenceById(id: number): Promise<Licences>;

    create(licence: CreateLicenceDto): Promise<Licences>;

    update(id: number, licence: UpdateLicenceDto): Promise<Licences>;

}
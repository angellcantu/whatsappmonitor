'use strict';

import { IsNotEmpty, IsOptional } from 'class-validator';
import { Licences } from '../licences/licences.entity';

export class CreatePhoneDto {

    @IsOptional()
    id?: number;

    @IsNotEmpty({ message: 'The licence_id field cannot be empty' })
    licence_id: number;

    @IsNotEmpty({ message: 'The phone_id field cannot be empty' })
    phone_id: number;

    @IsNotEmpty({ message: 'The number field cannot be empty' })
    number: string;

    @IsNotEmpty({ message: 'The name field cannot be empty' })
    name: string;

    @IsOptional()
    description: string;

    @IsOptional()
    licences?: Licences;

}
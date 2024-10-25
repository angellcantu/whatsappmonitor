'use strict';

import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGroupDto {

    @IsNotEmpty({ message: 'The `name` fiela cannot be empty.' })
    name: string;

    @IsOptional()
    image: string;

    @IsNotEmpty({ message: 'The `integrants` field cannot be empty.' })
    integrants: Array<string>;

    @IsOptional()
    message?: string;

}
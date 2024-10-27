'use strict';

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthDto {

    @IsNotEmpty({ message: 'The `public_key` field cannot be empty.' })
    @ApiProperty()
    public_key: string;

    @IsNotEmpty({ message: 'The `private_key` field cannot be empty.' })
    @ApiProperty()
    private_key: string;

}
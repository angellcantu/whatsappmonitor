'use strict';

import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {

    id: number;

    @IsNotEmpty({ message: 'The username field cannot be empty' })
    name: string;

    @IsNotEmpty({ message: 'The phone number field cannot be empty' })
    phone_number: string;

    @IsNotEmpty({ message: 'The username field cannot be empty' })
    username: string;

    @IsNotEmpty({ message: 'The password field cannot be empty' })
    password: string;

}

export class FindUserByUsernamePasswordDto {

    @IsNotEmpty({ message: 'The username field cannot be empty' })
    username: string;

    @IsNotEmpty({ message: 'The password field cannot be empty' })
    password: string;

}
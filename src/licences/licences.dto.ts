'use strict';

import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLicenceDto {

    @IsOptional()
    id: number | null;

    @IsOptional()
    user_id: number | null;

    @IsNotEmpty({ message: 'The name field cannot be empty' })
    name: string;

    @IsOptional()
    description: string | null;

    @IsNotEmpty({ message: 'The public_key field cannot be empty' })
    public_key: string;

    @IsNotEmpty({ message: 'The private_key field cannot be empty' })
    private_key: string;

}

export class UpdateLicenceDto {
    
    @IsOptional()
    user_id: number;

    @IsNotEmpty({ message: 'The name field cannot be empty' })
    name: string;

    @IsOptional()
    description: string;

    @IsNotEmpty({ message: 'The public_key field cannot be empty' })
    public_key: string;

    @IsNotEmpty({ message: 'The private_key field cannot be empty' })
    private_key: string;

    @IsOptional()
    active: boolean;

    @IsOptional()
    updated_at?: Date;

}
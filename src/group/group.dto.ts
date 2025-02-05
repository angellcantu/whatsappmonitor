'use strict';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGroupDto {

    @ApiProperty()
    @IsNotEmpty({ message: 'The `name` field cannot be empty.' })
    name: string;

    @ApiProperty()
    @ApiPropertyOptional()
    @IsOptional()
    image: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'The `integrants` field cannot be empty.' })
    integrants: Array<string>;

    @ApiProperty()
    @ApiPropertyOptional()
    @IsOptional()
    message?: string;

}

export class GetGroupInformation {

    @IsNotEmpty({ message: 'The group identifier is required.' })
    @IsNumber()
    @Type(() => Number)
    id: number;

}

/**
 * Add a new integrant in the group
 */
export class AddIntegrantDto {

    @ApiProperty()
    @IsNotEmpty({ message: 'The `id` field cannot be empty.' })
    id: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'The `integrants` field cannot be empty.' })
    integrants: Array<string>;

}

/**
 * Remove an integrant from a group
 */
export class RemoveIntegrantDto {

    @ApiProperty()
    @IsNotEmpty({ message: 'The `number` field cannot be empty.' })
    number: string;

}
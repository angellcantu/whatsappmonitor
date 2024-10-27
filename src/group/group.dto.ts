'use strict';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGroupDto {

    @ApiProperty()
    @IsNotEmpty({ message: 'The `name` fiela cannot be empty.' })
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
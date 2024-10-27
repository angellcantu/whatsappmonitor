'use strict';

import { Controller, HttpCode, HttpStatus, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { IAuthToken } from './auth.interface';
import { AuthDto } from './auth.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {

    constructor(private readonly auth: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @ApiOperation({ description: 'This service will return a new authorization token.' })
    @Post('/keys')
    async signInKeys(@Body() body: AuthDto): Promise<IAuthToken> {
        return this.auth.signInKeys(body.public_key, body.private_key);
    }

}
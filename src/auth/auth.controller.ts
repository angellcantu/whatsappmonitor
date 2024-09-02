'use strict';

import { Controller, HttpCode, HttpStatus, HttpException, Post, Req, Body } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { IAuthToken } from './auth.interface';

@Controller('auth')
export class AuthController {

    constructor(private readonly auth: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('/keys')
    async signInKeys(@Req() request: Request): Promise<IAuthToken> {
        if (request.headers && request.headers.authorization) {
            let keys = Buffer.from(request.headers.authorization.replace('Basic', ''), 'base64').toString('ascii');
            let [public_key, private_key] = keys.split(':');
            return this.auth.signInKeys(public_key, private_key);
        } else {
            throw new HttpException('Keys are required.', HttpStatus.UNAUTHORIZED);
        }
    }

}
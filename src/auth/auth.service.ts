'use strict';

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Connection } from 'typeorm';
import { IAuthRepository, IAuthUser, IAuthToken } from './auth.interface';

@Injectable()
export class AuthService implements IAuthRepository {

    constructor(
        private readonly jwt: JwtService,
        private readonly connection: Connection
    ) { }
    
    async signInKeys(public_key: string, private_key: string, ): Promise<IAuthToken> {
        if (!private_key || !public_key) {
            throw new HttpException('Invalid or missing keys.', HttpStatus.BAD_REQUEST);
        }
        let users = await this.connection.query('EXEC administracion.ValidateKeys @0, @1;', [public_key, private_key]);
        if (!users.length) {
            throw new HttpException('Invalid keys.', HttpStatus.BAD_REQUEST);
        }
        let user: IAuthUser = users[0];
        return { token: await this.jwt.signAsync(user) };
    }

}
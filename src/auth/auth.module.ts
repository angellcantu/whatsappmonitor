'use strict';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET || 'SERVIPRO_VIC2024',
            signOptions: {
                expiresIn: '30m'
            }
        })
    ],
    providers: [AuthService],
    controllers: [AuthController]
})
export class AuthModule { };
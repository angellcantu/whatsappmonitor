'use strict';

import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
    
    constructor(private readonly jwt: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.getToken(request);

        if (!token) {
            throw new HttpException('Token is missing.', HttpStatus.UNAUTHORIZED);
        }
        try {
            let payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_SECRET });
            request['user'] = payload;
        } catch {
            throw new HttpException('Token is missing or expired.', HttpStatus.UNAUTHORIZED);
        }
        return true;
    }

    private getToken(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : 'undefined';
    }

}
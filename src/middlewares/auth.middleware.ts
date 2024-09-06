'use strict';

import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    
    constructor(private readonly jwt: JwtService) { }

    /**
     * This function validate if the token exist, if exist then will decrypt it and saved the information in the response object.
     * @param request request object
     * @param response response object
     * @param next function to continue with the process
     */
    async use(request: Request, response: Response, next: NextFunction) {
        let token = this.getToken(request);
        if (!token) {
            throw new HttpException('Token is missing.', HttpStatus.UNAUTHORIZED);
        }
        try {
            let payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_SECRET });
            response.locals.auth = payload;
        } catch {
            throw new HttpException('Token is missing or expired.', HttpStatus.UNAUTHORIZED);
        }
        next();
    }

    /**
     * This function check if the authorization header exist in the headers object to get the token
     * @param request request object
     * @returns token or undefined value
     */
    private getToken(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : 'undefined';
    }

}
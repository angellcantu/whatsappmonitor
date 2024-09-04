'use strict';

import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Connection } from 'typeorm';
import { IWebhook, IPhoneCredentials } from '../whatsapp/whatsapp.interface';

@Injectable()
export class UatBotMiddleware implements NestMiddleware {

    constructor(private readonly connection: Connection) { }
    
    /**
     * This function validate if in the body object exist the `product_id` field to get the phone credentials from the database.
     * @param request request object
     * @param response response object
     * @param next function to continue with the process
     */
    async use(request: Request, response: Response, next: NextFunction) {
        let { product_id }: IWebhook = request?.body;
        
        if (product_id) {
            let credentials: Array<IPhoneCredentials> = await this.connection.query('EXEC uat.PhoneCredentials @0;', [product_id]);
            
            if (credentials.length) {
                let keys: IPhoneCredentials = credentials[0];
                response.locals.auth = keys;
            }
        }
        next();
    }

}
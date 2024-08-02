'use strict';

import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
    
    constructor(private readonly configService: ConfigService) { }
    
    createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
        return {
            type: 'mssql',
            host: this.configService.get<string>('DB_SERVER'),
            port: +this.configService.get<number>('DB_PORT'),
            username: this.configService.get<string>('DB_USER'),
            password: this.configService.get<string>('DB_PASSWORD'),
            database: this.configService.get<string>('DB_NAME'),
            options: {
                encrypt: false
            },
            synchronize: this.configService.get<string>('NODE_ENV') == 'development' ? true : false,
            logging: false,
            autoLoadEntities: true
        };
    }

}
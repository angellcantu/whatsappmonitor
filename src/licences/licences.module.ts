'use strict';

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Licences } from './licences.entity';
import { LicencesController } from './licences.controller';
import { LicencesService } from './licences.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';

@Module({
    imports: [TypeOrmModule.forFeature([Licences])],
    controllers: [LicencesController],
    providers: [LicencesService],
    exports: [LicencesService]
})
export class LicencesModule implements NestModule {
    
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes(LicencesController);
    }

}
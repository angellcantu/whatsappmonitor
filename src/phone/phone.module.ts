'use strict';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneController } from './phone.controller';
import { Phone } from './phone.entity';
import { Licences } from '../licences/licences.entity';
import { PhoneService } from './phone.service';
import { LicencesService } from '../licences/licences.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';

@Module({
    imports: [TypeOrmModule.forFeature([Phone, Licences])],
    controllers: [PhoneController],
    providers: [PhoneService, LicencesService],
    exports: [PhoneService]
})
export class PhoneModule implements NestModule {
    
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes(PhoneController);
    }

}
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { Group } from './group.entity';
import { Integrant } from 'src/integrant/integrant.entity';
import { IntegrantService } from 'src/integrant/integrant.service';
import { MaytApiService } from 'src/whatsapp/maytapi.service';
import { MessageService } from 'src/message/message.service';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';

@Module({
    imports: [TypeOrmModule.forFeature([Group, Integrant])],
    controllers: [GroupController],
    providers: [
        GroupService,
        IntegrantService,
        MaytApiService,
        MessageService
    ]
})
export class GroupModule implements NestModule {
    
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes(GroupController);
    }

}
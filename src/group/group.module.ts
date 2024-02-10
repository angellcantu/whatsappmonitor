import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupService } from './group.service';
import { Group } from './group.entity';
import { Integrant } from 'src/integrant/integrant.entity';
import { IntegrantService } from 'src/integrant/integrant.service';


@Module({
    imports: [TypeOrmModule.forFeature([Group, Integrant])],
    controllers: [],
    providers: [GroupService, IntegrantService]
})

export class GroupModule {}
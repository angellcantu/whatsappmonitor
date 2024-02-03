import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupService } from './group.service';
import { Group } from './group.entity';


@Module({
    imports: [TypeOrmModule.forFeature([Group])],
    controllers: [],
    providers: [GroupService]
})

export class GroupModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phone } from './phone.entity';
import { PhoneService } from './phone.service';


@Module({
    imports: [TypeOrmModule.forFeature([Phone])],
    controllers: [],
    providers: [PhoneService]
})

export class PhoneModule {}
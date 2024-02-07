import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phone } from './phone.entity';
import { PhoneService } from './phone.service';


@Module({
    imports: [TypeOrmModule.forFeature([Phone])],
    providers: [PhoneService],
    exports: [PhoneService]
})

export class PhoneModule {}
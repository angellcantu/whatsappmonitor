import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrantService } from './integrant.service';
import { Integrant } from './integrant.entity';
import { ContactService } from 'src/contact/contact.service';


@Module({
    imports: [TypeOrmModule.forFeature([Integrant]), ContactService],
    controllers: [],
    providers: [IntegrantService, ContactService]
})

export class IntegrantModule {}
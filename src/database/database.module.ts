import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';

@Module({
    imports: [TypeOrmModule.forRootAsync({
        useFactory: async () => 
        Object.assign(await getConnectionOptions(), {
            autoLoadEnitites: true,
        }),
    }),
    ]
})

export class DatabaseModule {}

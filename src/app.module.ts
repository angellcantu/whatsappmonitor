'use strict';

import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { PhoneModule } from './phone/phone.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './contact/contact.entity';
import { ContactModule } from './contact/contact.module';
import { Group } from './group/group.entity';
import { Integrant } from './integrant/integrant.entity';
import { IntegrantService } from './integrant/integrant.service';
import { GroupService } from './group/group.service';
import { MessageService } from './message/message.service';
import { Message } from './message/message.entity';
import { ConversationService } from './conversation/conversation.service';
import { Conversation } from './conversation/conversation.entity';
import { GroupController } from './group/group.controller';
import { GroupQueries } from './group/group.queries';
import { IntegrantQueries } from './integrant/integrant.queries';
import { ContactController } from './contact/contact.controller';
import { UpdateGroupInfoService } from './task/task.service';
import { UserModule } from './user/user.module';
import { LicencesModule } from './licences/licences.module';
import { MessageGateway } from './message/message.gateway';
import { LogService } from './log/log.service';
import { MaytApiService } from './whatsapp/maytapi.service';
import { FtpService } from './whatsapp/ftp.service';
import { Log } from './log/log.entity';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UatBotMiddleware } from './middlewares/uatbot.middleware';


@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: join(__dirname, '../.env')
		}),
		HttpModule,
		DatabaseModule,
		PhoneModule,
		ContactModule,
		TypeOrmModule.forFeature([Contact, Group, Integrant, Message, Conversation, Log]),
		UserModule,
		LicencesModule,
		AuthModule
	],
	controllers: [AppController, WebhookController, GroupController, ContactController],
	providers: [
		AppService,
		WebhookService,
		WhatsappService,
		IntegrantService,
		GroupService,
		MessageService,
		ConversationService,
		LogService,
		IntegrantQueries,
		GroupQueries,
		MessageGateway,
		UpdateGroupInfoService,
		MaytApiService,
		FtpService
	],
})
export class AppModule implements NestModule {
	
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(UatBotMiddleware)
			.exclude(
				{ path: '/', method: RequestMethod.POST },
				{ path: '/', method: RequestMethod.GET },
				{ path: '/test', method: RequestMethod.POST },
				{ path: '/excel', method: RequestMethod.POST }
			)
			.forRoutes(WebhookController);
	}

}
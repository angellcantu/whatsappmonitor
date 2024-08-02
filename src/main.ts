'use strict';

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const logger = new Logger('Main');

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ['debug', 'error', 'fatal', 'log', 'verbose', 'warn']
	});
	app.enableCors({
		origin: ['https://whatswatch.tamaulipas.app',
			"http://localhost:54476"],
		methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true
	});
	app.useGlobalPipes(new ValidationPipe());
	await app.listen(process.env.PORT || 3000);
	logger.log(`Main service started on port ${process.env.PORT || 3000}`);
}

bootstrap();
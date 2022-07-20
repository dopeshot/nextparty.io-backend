import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.setGlobalPrefix('api');

    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('ejs');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const config = new DocumentBuilder()
        .setTitle('Truth or Dare: Community Backend')
        .setDescription('Back! End! Back! End! Back! End! End!')
        .setVersion('0.1')
        .addTag('auth', 'All related to authorization')
        .addTag('categories', 'Only for admins. Categories contains Sets')
        .addTag('reports', 'Report Users, Tasks or Sets')
        .addTag('search', 'Search for Users or Sets')
        .addTag('sets', 'Set is a collection of tasks')
        .addTag('users', 'User related content')
        .addTag('migration', 'Import and export data')
        .addBearerAuth()
        .addBasicAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
    app.enableCors();
    await app.listen(+process.env.PORT || 3001, () =>
        Logger.log(`Nest listening on ${process.env.HOST}`, 'Bootstrap')
    );
}
bootstrap();
